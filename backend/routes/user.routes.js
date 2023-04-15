const express = require("express")
const UserController = require('../controllers/user.controller.js')
let multer = require('multer')
let upload = multer()
const router = express.Router()
const authMiddleware = require('../middlewares/auth.middleware')
const validationMiddleware = require('../middlewares/validation.middleware')



router.post('/registration', validationMiddleware('registration'), UserController.registration)

router.post('/login', validationMiddleware('email/password'), UserController.login)

router.post('/logout', UserController.logout)

router.post('/refresh', UserController.refresh)

router.post('/update-user', authMiddleware, upload.single('file'), UserController.updateUser)

router.get('/get-user', authMiddleware, UserController.getUser)

router.post('/like-dislike-comment', authMiddleware, validationMiddleware('commentId/action'), UserController.likeOrDislikeComment)

module.exports = router;
