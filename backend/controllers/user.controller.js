const {validationResult} = require('express-validator')
const UserService = require('../service/user.service')
const ApiError = require('../exceptions/api-error')


class UserController {

    async registration(req, res, next) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Bad request', errors.array()))
            }
            const {username, email, password} = req.body

            const data = await UserService.registration(username, email, password)

            res.cookie('refreshToken', data.tokens.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'none', secure: true})

            return res.json(data)

        } catch (e) {
            next(e)
        }
    }

    async login(req, res, next) {
        try {
            const errors = validationResult(req)

            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Bad request', errors.array()))
            }

            const {email, password} = req.body

            const tokens = await UserService.login(email, password)

            res.cookie('refreshToken', tokens.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'none', secure: true})

            return res.json({tokens})
        } catch (e) {
            next(e)
        }
    }

    async logout(req, res, next) {
        try {

            const {refreshToken} = req.cookies

            await UserService.logout(refreshToken)

            res.clearCookie('refreshToken')
            return res.json(200)

        } catch (e) {
            next(e)
        }
    }

    async refresh(req, res, next) {
        try {
            const {refreshToken} = req.cookies

            if(!refreshToken){
                return next(ApiError.UnAuthorizedError('unauthorized'))
            }

            const tokens = await UserService.refresh(refreshToken)
            res.cookie('refreshToken', tokens.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'none', secure: true})
            res.json(tokens)
        } catch (e) {
            next(e)
        }
    }

    async getUser(req, res, next) {
        try {

            const {id} = req.user
            const user = await UserService.getUser(id)
            if(user){
                res.json(user)
            } else {
                res.status(401).json('didnt find')
            }
        } catch (e) {
            next(e)
        }
    }

    async updateUser(req, res, next) {
        try {
            const errors = validationResult(req)

            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Bad request', errors.array()))
            }

            const { username } = req.body || null
            const { id } = req.user
            const file = req.file || null

            if(file && file.buffer.length > 1024000){
                return next(ApiError.BadRequest('Bad request', ['image must be less then 1 mb']))
            }

            if(!username && !file){
                return next(ApiError.BadRequest('Bad request', ['specify avatar or username']))
            }

            const updatedData = await UserService.updateUser(id, username, file)
            res.json(updatedData)
        } catch (e) {
            next(e)
        }

    }

    async likeOrDislikeComment(req,res,next){
        try {
            const errors = validationResult(req)

            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Bad request', errors.array()))
            }
            const {id: user} = req.user
            const {commentId, action} = req.body

            await UserService.likeOrDislikeComment(user,commentId, action)

            res.json(200)

        } catch (e) {
            next(e)
        }

    }
}

module.exports = new UserController();
