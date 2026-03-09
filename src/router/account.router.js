const express = require('express')
const authMiddleware = require('../middlewares/auth.middleware.js')
const AccountController = require('../controllers/account.controller.js')

const router = express.Router()

router.post('/', authMiddleware.authMiddleware, AccountController.createAccountController)

router.post('/', authMiddleware.authMiddleware, AccountController.getUserAccountController)

router.post('/balance/:accountId', authMiddleware.authMiddleware, AccountController.getAccountBalanceController)

module.exports = router
