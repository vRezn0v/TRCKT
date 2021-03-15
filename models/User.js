const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    displayName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
})

userSchema.pre('save', async function(next) {
    const user = this;

    try {
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(user.password, salt)
        user.password = hash
        next()
    } catch (err) {
        console.log(err)
    }
})

userSchema.methods.comparePassword = async function(candidate) {
    try {
        var isMatch = await bcrypt.compare(candidate, this.password)
        return isMatch
    } catch (err) {
        console.log(err)
    }
}

module.exports = mongoose.model('User', userSchema)