const db = require("../db-related/db");

class CommentService {

    async getComments(page) {
        let limit = 5
        let {rowCount: majorCommentsCount} = await db.query(`SELECT id
                                                             FROM comment
                                                             where isMajor = true`)


        let offset = majorCommentsCount - (page * limit)
        if (offset < 0) {
            offset = 0
            limit = majorCommentsCount - (page * limit - limit)
        }


        return await db.query(`SELECT *
                               FROM comment
                               WHERE isMajor = true
                               ORDER BY id
                               OFFSET ${offset} LIMIT ${limit}
        `)

    }

    async getChildComments(commentId) {
        const {rows} = await db.query('SELECT parentOf FROM comment where id = $1', [commentId])
        let pastText = ""
        let allComments = []
        let childValues = []
        if (rows[0] && rows[0].parentof) {

            let parent = rows[0].parentof
            for (let i = 0; i < parent.length; i++) {
                pastText += `id = $${i + 1} OR `
                childValues.push(parent[i])
            }
            pastText = pastText.slice(0, pastText.length - 3)

            const childs = await db.query(`SELECT *
                                           FROM comment
                                           where ${pastText} `, [...childValues])
            for (let child of childs.rows) {
                allComments.push(child)
            }

        }

        return allComments

    }

    async createComment({author, username, text, image, isMajor, publicationDate, gradation, parentId}) {
        gradation = gradation || 1
        const {rows: comment} = await db.query(`INSERT INTO comment (author, username, text, image, isMajor, publicationDate, gradation)
                                                values ($1, $2, $3,
                                                        $4, $5, $6,
                                                        $7) RETURNING *`, [author, username, text, image, isMajor, publicationDate, gradation])
        if (parentId > 0) {
            const {rows} = await db.query('SELECT parentOf FROM comment where id = $1', [parentId])

            const childs = rows[0].parentof || []
            if (childs.length > 5) {
                throw new Error('too much comments for this reply')
            }
            childs.push(comment[0].id)
            await db.query('UPDATE comment set parentOf = $1 where id = $2', [childs, parentId])
        }
        return comment[0]

    }

    async getPaginationLength(){
        return await db.query(`SELECT id FROM comment where isMajor = true`)
    }

}

module.exports = new CommentService()
