const mongoose = required("mongoose")

const tokenBlacklistSchema = new mongoose.Schema({
      token: {
        type: String,
        required: [ true, "Token is required to blacklist" ],
        unique: [ true, "Token is already blacklisted"]
      }
}, {
    timestamps: true
})

tokenBlacklistSchema.index({ createAt: 1 }, {
    expireAfterSeconds: 60 * 60 * 24 * 3
})

const tokenBlacklistModel = mongoose.model("tokenblackList", tokenBlacklistSchema)

module.exports = tokenBlacklistModel