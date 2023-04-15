const events = require('events')
const emitter = new events.EventEmitter()

const notify = (id, username) => {
    emitter.emit('notify', id, username)
}

const observing = (res, id) => {
    emitter.on('notify', (authorId, username)=>{

        // if(id !== authorId){
        //     res.write(`data: ${username} made new message! Reload page to see it \n\n`)
        // }

        res.write(`data: ${username} made new message! Reload page to see it \n\n`)
    })
}
module.exports = {notify, observing}
