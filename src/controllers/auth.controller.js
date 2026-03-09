const userModel = require("../models/user.model.js")
const jwt = require("jsonwebtoken")
const { sendRegistrationEmail } = require('../services/email.service.js')
const tokenBlacklistModel = require('../models/blackList.model.js')

async function userRegisterController(req, res){

    const { password, email, name } = req.body

    const isExists = await userModel.findOne({
          email: email
    })

    if(isExists){
        return res.status(422).json({
               message: "User already exists with email",
               status: "failed"
        })
    }

    const user = await userModel.create({
          password, email, name
    })

    const token = jwt.sign({
          userId: user._id
    }, process.env.JWT_SECRET, { expiresIn: "3d"})

    res.cookie("token", token)

    res.status(201).json({
        user: {
            _id: user._id,
            email: user.email,
            name: user.name
        }
    })
    await sendRegistrationEmail(user.email, user.name)
} 

async function userLoginController(req, res){

    const { email, password } = req.body

    const user = await userModel.findOne({ email }).select("+password")

    if(!user){
        return res.status(401).json({
            message: "Email or password is Invalid"
        }) 
    }

    const isValidPassword = await user.comparePassword(password)

    if(!isValidPassword){
        return res.status(401).json({
            message: "Email or password is Invalid"
        })
    }

    const token = jwt.sign({
          userId: user._id,
    }, process.env.JWT_SECRET, { expiresIn: "3d" })

    res.cookie("token", token)

    res.status(200).json({
        user:{
            _id: user._id,
            email: user.email,
            name: user.name
        }
    })
}


async function userLogoutController(req, res){

    const token = req.cookies.token || req.headers.authorization?.split(" ")[ 1 ]

    if(!token){
        return res.status(200).json({
            message: "User Logout successfully"
        })
    }

    await tokenBlacklistModel.create({
        token: token
    })

    res.clearCookie("token")

    res.status(200).json({
        message: "User Logout successfully"
    })
}
module.exports = { userRegisterController, userLoginController, userLogoutController }