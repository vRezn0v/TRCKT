const express = require('express')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const logger = require('volleyball')

const port = process.env.PORT || 5500

const authRouter = require('./routes/auth')
const userRouter = require('./routes/user')
const tasksRouter = require('./routes/tasks')

console.log('[*] Connecting to Database...')
mongoose.connect('mongodb://localhost/trcktdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}).then(
    () => console.log('[+] Database Connection Successful'),
    err => {
        console.error('[-] Database Connection Failed, Exiting.', err)
        process.exit(-1)
    }
)

console.log('[*] Configuring Express Server')
const app = express()
app.use(logger)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// use routes
app.use('/auth', authRouter)
app.use('/api/tasks', tasksRouter)
app.use('/api/user', userRouter)



app.listen(port, () => console.log(`[+] TRCKT server running at PORT: ${port}`))

module.exports = app