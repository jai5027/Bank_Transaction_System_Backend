const express = require('express')
const authRouter = require('./router/auth.router.js')
const cookieParser = require('cookie-parser')
const accountRouter = require('./router/account.router.js')

const app = express()
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRouter)
app.use('/api/accounts', accountRouter)

module.exports = app