const moment = require('moment')
const mongoose = require('mongoose')

const refreshTokenSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    token: String,
    expires: Date,
    issued: { type: Date, default: moment().utc().valueOf() },
    revoked: Date,
    replacedByToken: String
})

refreshTokenSchema.virtual('isExpired').get(function() {
    return moment.utc.valueOf() >= this.expires
})

refreshTokenSchema.virtual('isActive').get(function() {
    return !this.revoked && !this.isExpired
})

refreshTokenSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function(doc, ret) {
        delete ret._id
        delete ret._id
        delete ret.user
    }
})

module.exports = mongoose.model('RefreshToken', refreshTokenSchema)