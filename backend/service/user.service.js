const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require("../db-related/db");
const ApiError = require('../exceptions/api-error')
const stream = require('stream')
const {google} = require('googleapis')

const generateJWTTokens = (id) => {
    const payload = {
        id
    }
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {expiresIn: '5h'})
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {expiresIn: '30d'})
    return {
        accessToken, refreshToken
    }
}

const addNicknameToGoogleSheet = async (nickname, userId) => {
    const scopes = ["https://www.googleapis.com/auth/spreadsheets"]
    const spreadsheetId = "125Ta6spqMoaPPIzrQiXgFB_0R2IcyxMsjmu22_etmxo";
    const auth = new google.auth.GoogleAuth({
        credentials: {
            "type": "service_account",
            "project_id": "original-spider-381608",
            "private_key_id": process.env.GOOGLE_PRIVATE_KEY_ID,
            "private_key": process.env.GOOGLE_PRIVATE_KEY,
            "client_email": process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            "client_id": "116448825723233860603",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/spa-comments-avatars-storage%40original-spider-381608.iam.gserviceaccount.com"
        },
        scopes: scopes,
    });
    const authClientObject = await auth.getClient();
    const googleSheetsInstance = google.sheets({version: "v4", auth: authClientObject});
    const {data} = await googleSheetsInstance.spreadsheets.values.get({
        spreadsheetId,
        range: "Лист1!A:A",
    })
    const request = {
        spreadsheetId: spreadsheetId,
        range: `A${data.values.length + 1}:C${data.values.length + 1}`,
        valueInputOption: "RAW",
        resource: {
            values: [[data.values.length, nickname, userId]]
        }
    }
    await googleSheetsInstance.spreadsheets.values.append(request)

}


class UserService {

    async registration(username, email, password) {
        const isUserExist = await db.query('SELECT username FROM person where username = $1', [username])
        const isEmailExist = await db.query('SELECT mail FROM person where mail = $1', [email])

        if (isUserExist.rows.length || isEmailExist.rows.length) {
            throw ApiError.BadRequest('user with such username/email already exist')
        }

        const hashedPassword = bcrypt.hashSync(password, 7)

        const newUser = await db.query(`INSERT INTO person (username, mail, password)
                                        values ($1, $2, $3) RETURNING *`, [username, email, hashedPassword])

        const tokens = generateJWTTokens(newUser.rows[0].id)

        await db.query('UPDATE person set refreshToken = $1 where id =$2', [tokens.refreshToken, newUser.rows[0].id])
        await addNicknameToGoogleSheet(username, newUser.rows[0].id)

        return {tokens, username, email}
    }

    async login(email, password) {

        const findUser = await db.query('SELECT password, id FROM person where mail = $1', [email])

        if (!findUser.rows.length) {
            throw ApiError.BadRequest('user with such email doesnt exist')
        }

        const validPassword = bcrypt.compareSync(password, findUser.rows[0].password)

        if (!validPassword) {
            throw ApiError.BadRequest('Incorrect password')
        }

        const tokens = generateJWTTokens(findUser.rows[0].id)

        await db.query('UPDATE person set refreshToken = $1 where id = $2', [tokens.refreshToken, findUser.rows[0].id])

        return tokens

    }

    async logout(refreshToken) {
        await db.query('UPDATE person set refreshToken = $1 where refreshToken =$2', [null, refreshToken])
    }

    async refresh(refreshToken) {
        const data = this.validateRefreshToken(refreshToken)
        const user = await db.query('SELECT id FROM person where id = $1', [data.id])

        if (!data || !user.rowCount) {
            throw ApiError.UnAuthorizedError('unauthorized')
        }

        const tokens = generateJWTTokens(data.id)

        await db.query('UPDATE person set refreshToken = $1 where id = $2', [tokens.refreshToken, data.id])

        return tokens
    }

    async likeOrDislikeComment(userId, commentId, action) {

        if (action === true) {
            const {rows: findUserDislikes} = await db.query('SELECT dislikes FROM person where id = $1', [userId])
            findUserDislikes[0].dislikes = findUserDislikes[0].dislikes || []

            if (findUserDislikes[0].dislikes.includes(commentId)) {
                findUserDislikes[0].dislikes.splice(findUserDislikes[0].dislikes.indexOf(commentId), 1)
                await db.query('UPDATE person set dislikes = $1 where id = $2', [findUserDislikes[0].dislikes, userId])
                const {rows: findComment} = await db.query('SELECT dislikes FROM comment where id = $1', [commentId])
                await db.query('UPDATE comment set dislikes = $1 where id = $2', [findComment[0].dislikes - 1, commentId])
            }

            const {rows: findUserLikes} = await db.query('SELECT likes FROM person where id = $1', [userId])
            findUserLikes[0].likes = findUserLikes[0].likes || []
            if (!findUserLikes[0].likes.includes(commentId)) {
                findUserLikes[0].likes.push(commentId)

                await db.query('UPDATE person set likes = $1 where id = $2', [findUserLikes[0].likes, userId])

                const {rows: findComment} = await db.query('SELECT likes FROM comment where id = $1', [commentId])

                const newLikes = parseInt(findComment[0].likes || '0') + 1
                await db.query('UPDATE comment set likes = $1 where id = $2', [newLikes, commentId])

            } else {
                throw ApiError.BadRequest('already liked')
            }

        } else {
            const {rows: findUserLikes} = await db.query('SELECT likes FROM person where id = $1', [userId])
            findUserLikes[0].likes = findUserLikes[0].likes || []

            if (findUserLikes[0].likes.includes(commentId)) {
                findUserLikes[0].likes.splice(findUserLikes[0].likes.indexOf(commentId), 1)
                await db.query('UPDATE person set likes = $1 where id = $2', [findUserLikes[0].likes, userId])
                const {rows: findComment} = await db.query('SELECT likes FROM comment where id = $1', [commentId])
                await db.query('UPDATE comment set likes = $1 where id = $2', [findComment[0].likes - 1, commentId])
            }
            const {rows: findUserDislikes} = await db.query('SELECT dislikes FROM person where id = $1', [userId])
            findUserDislikes[0].dislikes = findUserDislikes[0].dislikes || []

            if (!findUserDislikes[0].dislikes.includes(commentId)) {

                findUserDislikes[0].dislikes.push(commentId)
                await db.query('UPDATE person set dislikes = $1 where id = $2', [findUserDislikes[0].dislikes, userId])

                const {rows: findComment} = await db.query('SELECT dislikes FROM comment where id = $1', [commentId])

                const newDislikes = parseInt(findComment[0].dislikes || '0') + 1
                await db.query('UPDATE comment set dislikes = $1 where id = $2 ', [newDislikes, commentId])

            } else {
                throw ApiError.BadRequest('already disliked')
            }
        }

    }

    async getUser(id) {
        const {rows} = await db.query('SELECT id, username, mail, dislikes, likes, avatar_url FROM person where id = $1', [id])
        return rows[0]
    }

    async updateUser(id, username, file) {
        let img
        if (username) {
            const {rows} = await db.query('UPDATE person set username = $1 where id =$2 RETURNING id, username, mail, dislikes, likes, avatar_url', [username, id])
            await db.query('UPDATE comment set username = $1 where author =$2 ', [username, id])
            await addNicknameToGoogleSheet(username, id)
            if (!file) {
                return rows[0]
            }
        }


        const scopes = ['https://www.googleapis.com/auth/drive']
        const auth = new google.auth.GoogleAuth({
            credentials: {
                "type": "service_account",
                "project_id": "original-spider-381608",
                "private_key_id": process.env.GOOGLE_PRIVATE_KEY_ID,
                "private_key": process.env.GOOGLE_PRIVATE_KEY,
                "client_email": process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                "client_id": "116448825723233860603",
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/spa-comments-avatars-storage%40original-spider-381608.iam.gserviceaccount.com"
            },
            scopes: scopes
        })
        const format = file.originalname.split('.')
        const bufferStream = new stream.PassThrough()
        bufferStream.end(file.buffer)

        const requestBody = {
            name: `${id}.${format[1]}`,
            mimeType: file.mimetype,
            parents: ['1e59n4Km8HdW8h42BWrNVI0O2q3zjIdp9']

        }

        const media = {
            mimeType: file.mimetype,
            body: bufferStream,

        }
        const {rows: previousAvatar} = await db.query('SELECT avatar_url FROM person where id = $1', [id])

        if (previousAvatar[0].avatar_url) {
            const fileId = previousAvatar[0].avatar_url.split('=')

            await google.drive({version: 'v3', auth: auth}).files.delete({
                fileId: fileId[2],
            })
        }

        const response = await google.drive({version: 'v3', auth: auth}).files.create({
            media: media,
            requestBody: requestBody,
            fields: 'id'
        })
        const fileId = response.data.id

        img = `https://drive.google.com/uc?export=view&id=${fileId}`

        const {rows} = await db.query('UPDATE person set avatar_url = $1 where id =$2 RETURNING id, username, mail, dislikes, likes, avatar_url', [img, id])

        await db.query('UPDATE comment set username = $1, image = $2 where author =$3 ', [username, img, id])

        return rows[0]

    }


    validateAccessToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_ACCESS_SECRET)
        } catch (e) {
            return null
        }
    }

    validateRefreshToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_REFRESH_SECRET)
        } catch (e) {
            return null
        }
    }
}

module.exports = new UserService()
