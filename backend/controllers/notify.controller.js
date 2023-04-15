const {validateRefreshToken} = require('../service/user.service')
const {observing} = require("../events/EventEmitter");

class NotifyController {

    async handleConnection(req, res, next) {
        try{
            res.writeHead(200, {
                'Connection': 'keep-alive',
                'Content-Type':'text/event-stream',
                'Cache-Control': 'no-cache',
                'Access-Control-Allow-Origin': '*'
            })
            const {refreshToken} = req.cookies
            const userData = validateRefreshToken(refreshToken)
            if(userData && userData.id){
                observing(res, userData.id)
            }
        } catch (e) {
            next(e)
        }
    }



}
module.exports = new NotifyController();
