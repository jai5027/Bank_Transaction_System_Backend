const { Router } = require('express');
const Middleware = require("../middlewares/auth.middleware.js")
const Transaction = require("../controllers/transaction.controller.js")

const transactionRoutes = Router()

transactionRoutes.post("/", Middleware.authMiddleware, Transaction.createTransaction)

transactionRoutes.post("/system/initial-funds", Middleware.authSystemUserMiddlware, Transaction.createInitialFundsTransaction)

module.exports = transactionRoutes
