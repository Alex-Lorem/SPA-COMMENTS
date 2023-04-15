const {param, check} = require("express-validator");
module.exports  = (value) => {
    switch (value) {
        case 'get-comments':
            return [
                param('page', "page required").isInt({
                    min: 1,
                })
            ]
        case 'childs-comments':
            return [
                param('commentId', "invalid comment id").isInt({
                    min: 1,
                }),

            ]
        case 'create-comment':
            return [
                check('author', "try to reload page").isInt({min: 1}),
                check('text', "try to reload page").isLength({
                    min: 4,
                    max: 102399
                }),
                check('isMajor', "try to reload page").isBoolean(),
                check('publicationDate', "try to reload page").isDate(),
                check('parent', "try to reload page").isInt({min: 0})
            ]
        case 'registration':
            return [
                check('username', "Username must to be more than 2 and less than 15 characters").isLength({
                    min: 2,
                    max: 15
                }),
                check('email', "Invalid email").isEmail(),
                check('password', "Password must to be more than 4 and less than 10 characters").isLength({
                    min: 4,
                    max: 10
                })
            ]
        case 'email/password':
            return [
                check('email', "Invalid email").notEmpty().isEmail(),
                check('password', "Password must to be more than 4 and less than 10 characters").isLength({
                    min: 4,
                    max: 10
                })
            ]
        case 'commentId/action':
            return [
                check('commentId', "invalid commentId, try to reload page").isInt({min: 1}),
                check('action', "bad request, try to reload page").isBoolean()
            ]

    }
}
