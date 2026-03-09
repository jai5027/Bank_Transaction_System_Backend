const userModel = require('../models/user.model.js')
const jwt = require('jsonwebtoken')
const tokenBlacklistModel = require('../models/blackList.model.js')

async function authMiddleware(req, res, next){

    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]
    
    if(!token){
        return res.status(401).json({
               message: "Unauthorized access, token is missing"
        })
    }

    const isBlacklisted = await tokenBlacklistModel.findOne({ token })
    
    if(!isBlacklisted){
        return res.status(401).json({
            message: "Unauthorized access, token is Invalid"
        })
    }

     try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await userModel.findById(decoded.userId)
        req.user = user
        return next()
        
    } catch (error) {
        return res.status(401).json({
               message: "Unauthorized access, token is Invalid"   
        })
    }
}

async function authSystemUserMiddlware(req, res, next){

    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if(!token){
        return res.status(401).json({
            message: "Unauthorized access, token is missing"
        })
    }

        const isBlacklisted = await tokenBlacklistModel.findOne({ token })
    
    if(!isBlacklisted){
        return res.status(401).json({
            message: "Unauthorized access, token is Invalid"
        })
    }

    try {
        
        const decoded = await jwt.verify(token, process.env.JWT_SECRET)

        const user = await userModel.findById(decoded.userId).select("+systemUser")
        if(!user.systemUser){
            return res.status(403).json({
                message: "Forbidden access, not a system user"
            })
        }  
        req.user = user

        return next() 

    } catch (error) {
        return res.status(401).json({
            message: "Unauthorized access, token is Invalid"
        })
    }
}

module.exports = { authMiddleware, authSystemUserMiddlware }