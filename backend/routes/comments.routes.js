const express = require("express")
const CommentsController = require('../controllers/comments.controller.js')
const notifyController = require('../controllers/notify.controller')
const router = express.Router()
const authMiddleware = require('../middlewares/auth.middleware')
const validationMiddleware = require('../middlewares/validation.middleware')



router.get('/connect', notifyController.handleConnection)

router.get('/get-comments/:page', validationMiddleware('get-comments'), CommentsController.getComments)

router.get('/get-pagination-length', CommentsController.getPaginationLength)

router.get('/childs-comments/:commentId', validationMiddleware('childs-comments'), CommentsController.getChildsComments)

router.post('/create-comment', authMiddleware, validationMiddleware('create-comment'), CommentsController.createComment)


module.exports = router;
