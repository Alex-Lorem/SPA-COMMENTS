const CommentService = require('../service/comment.service')

const {notify} = require('../events/EventEmitter')
const ApiError = require("../exceptions/api-error");
class CommentsController {

    async getComments(req, res, next) {
        try {
            const {page} = req.params

            let {rows: comments} = await CommentService.getComments(page)

            for(let i = 0; i < comments.length; i++){
                for(let j = 0; j < ( comments.length - i -1 ); j++){
                    if(comments[j].id < comments[j+1].id){
                        let temp = comments[j]
                        comments[j] = comments[j + 1]
                        comments[j+1] = temp
                    }
                }
            }
            res.json(comments)
        } catch (e) {
            next(e)
        }
    }

    async getChildsComments(req, res, next) {
        try {
            const {commentId} = req.params

            const comments = await CommentService.getChildComments(commentId)

            res.json(comments)

        } catch (e) {
            next(e)
        }
    }

    async createComment(req, res, next) {
        try {
            const {username, text, image, isMajor, publicationDate, parentId, gradation} = req.body

            if(text.length < 5){
                return next(ApiError.BadRequest('Bad request', ['text must to have more than 5 symbols']))
            }

            if(gradation > 6){
                return next(ApiError.BadRequest('Bad request', ['too much replies for this topic']))
            }

            const {id: author} = req.user
            const comment = await CommentService.createComment({
                author:author,
                username:username,
                text:text,
                image:image,
                isMajor:isMajor,
                publicationDate:publicationDate,
                gradation:gradation,
                parentId:parentId})

            notify(author, username)

            res.json(comment)
        } catch (e) {
            next(e)
        }
    }
    async getPaginationLength(req, res, next){
        try {
            const {rowCount: length} = await CommentService.getPaginationLength()

            res.json(Math.ceil(length / 5))
        } catch (e) {
            next(e)
        }
    }


}

module.exports = new CommentsController();
