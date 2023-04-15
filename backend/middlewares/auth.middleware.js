const ApiError = require('../exceptions/api-error')
const {validateAccessToken} = require('../service/user.service')

module.exports = (req,res,next) =>{
    try{
        const authorizationHeader = req.headers.authorization



        if(!authorizationHeader){
            return next(ApiError.UnAuthorizedError());
        }

        const accessToken = authorizationHeader.split(' ')[1]

        if(!accessToken || !req.cookies.refreshToken){
            return next(ApiError.UnAuthorizedError());
        }

        const userData = validateAccessToken(accessToken)

        if(!userData){
            return next(ApiError.UnAuthorizedError());
        }
        req.user = userData

        next()

    } catch (e) {
        return next(ApiError.UnAuthorizedError());
    }
}
