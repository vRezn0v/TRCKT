const jwt = require('jwt-simple')
const status = require('http-status-codes').StatusCodes

const User = require('../models/User')
const config = require('../config')

const { redisUtils } = require('../redis')

const moment = require('moment')
const { EXPIRE, EMAIL_PATTERN, PASSWORD_LENGTH, DISPLAY_LENGTH, LOGOUT_SUCCESS, ERR_EMAIL_TAKEN, ERR_INVALID_CREDS } = require('../constants/constants')

const validateEmail = (email) => {
    return EMAIL_PATTERN.test(String(email).toLowerCase())
}



exports.generateToken = user => {
    const timestamp = moment().unix()
    return jwt.encode({ iss: 'TRCKT', sub: user.id, iat: timestamp, exp: timestamp + EXPIRE },
        config.authSecret
    )
}

exports.signup = async(req, res, next) => {
    try {
        const { email, password, displayName } = req.body

        if (!email || !validateEmail(email) || !password || password.length < PASSWORD_LENGTH || !displayName || displayName.length < DISPLAY_LENGTH)
            return res.status(status.UNPROCESSABLE_ENTITY).send(ERR_INVALID_CREDS)

        var existingUser = await User.findOne({ email })
        if (existingUser) return res.status(status.UNPROCESSABLE_ENTITY).send(ERR_EMAIL_TAKEN)

        const user = new User({ email, password, displayName })
        await user.save()
        res.status(status.CREATED).send({
            token: exports.generateToken(user),
            user: {
                email,
                displayName
            }
        })
    } catch (err) {
        console.log(err)
    }
}

exports.login = (req, res) => {
    const { email, displayName } = req.user
    res.status(status.ACCEPTED).json({
        token: exports.generateToken(req.user),
        user: {
            email,
            displayName
        }
    })
}

exports.logout = async(req, res) => {
    const token = req.headers.authorization.replace('bearer ', '')
    const user = req.user.id

    try {
        const data = await redisUtils.getUser(user)
        if (data !== null) {
            const parsedData = JSON.parse(data)
            parsedData[user].push(token)
            redisUtils.setExpire(user, JSON.stringify(parsedData[user]))
        }
        const blacklistData = {
            [user]: [token]
        }
        await redisUtils.setExpire(user, JSON.stringify(blacklistData))
        res.status(status.OK).send(LOGOUT_SUCCESS)
    } catch (err) {
        console.log(err)
    }
}