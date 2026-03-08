const { Router } = require('express');
const authMiddleware = require("../middlewares/auth.middleware.js")

const transactionRoutes = Router()

transactionRoutes.post("/", authMiddleware.authMiddleware)

module.exports = transactionRoutes