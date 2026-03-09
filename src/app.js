const express = require('express')
const authRouter = require('./router/auth.router.js')
const cookieParser = require('cookie-parser')
const accountRouter = require('./router/account.router.js')
const transactionRouter = require('./router/transaction.route.js')

const app = express()
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRouter)
app.use('/api/accounts', accountRouter)

app.use('/api/transactions', transactionRouter)

module.exports = app