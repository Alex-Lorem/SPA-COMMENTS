const express = require("express")
const cors = require('cors')
const cookieParser = require('cookie-parser')
const path = require('path');
const commentsRouter = require('./routes/comments.routes.js')
const userRouter = require('./routes/user.routes.js')
const errorMiddleware = require('./middlewares/errors.middleware')


const PORT = process.env.PORT || 5000;
const app = express()

global.root = path.resolve(__dirname);


app.use(express.json())
app.use(cookieParser())
app.use(cors({
    credentials: true,
    origin: "https://alex-lorem.github.io",
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "HEAD", "PATCH", "DELETE"],
}))


app.use('/api', userRouter)
app.use('/api', commentsRouter)


app.use(errorMiddleware)


async function startApp() {
    try {

        app.listen(PORT,() => console.log('SERVER STARTED ON PORT: ' + PORT))
        app.keepAliveTimeout = 20000;
    } catch (e) {
        console.log(e)
    }

}

startApp()
