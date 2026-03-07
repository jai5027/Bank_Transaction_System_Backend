const express = require('express')
const { userRegisterController }  = require('../controllers/auth.controller.js')
const { userLoginController } = require('../controllers/auth.controller.js')

const router = express.Router()

router.post('/register', userRegisterController)
router.post('/login', userLoginController)

module.exports = router