const jwt = require('jwt-simple')
const moment = require('moment')

const crypto = require('crypto')
const status = require('http-status-codes').StatusCodes

const User = require('../models/User')
const RefreshToken = require('../models/refreshToken')
const config = require('../config')

const { redisUtils } = require('../redis')

const { EXPIRE, REFRESH_EXPIRE, LOGOUT_SUCCESS, ERR_EMAIL_TAKEN, ERR_INVALID_CREDS, ERR_INVALID_RTK, ERR_SIGNUP } = require('../constants/constants')
const { validateCredentials } = require('../constants/validation')


const randomTokenString = () => {
    return crypto.randomBytes(40).toString('hex')
}


exports.generateToken = user => {
    const timestamp = moment().utc().valueOf()
    return jwt.encode({ iss: 'TRCKT', sub: user.id, iat: timestamp, exp: timestamp + EXPIRE },
        config.authSecret
    )
}

exports.generateRefreshToken = async(user, returnToken) => {
    var data = new RefreshToken({
        user: user.id,
        token: randomTokenString(),
        expires: moment().utc().valueOf() + REFRESH_EXPIRE
    })
    data = await data.save()
    if (returnToken) return data.token
    return data
}

exports.signup = async(req, res, next) => {
    try {
        if (!req.body.hasOwnProperty("email") || !req.body.hasOwnProperty("email") || !req.body.hasOwnProperty("email")) return res.status(status.UNPROCESSABLE_ENTITY).send(ERR_INVALID_CREDS)

        let { email, password, displayName } = req.body

        if (!validateCredentials({ email, password, displayName }))
            return res.status(status.UNPROCESSABLE_ENTITY).send(ERR_INVALID_CREDS)

        var existingUser = await User.findOne({ email })
        if (existingUser) return res.status(status.UNPROCESSABLE_ENTITY).send(ERR_EMAIL_TAKEN)

        const user = new User({ email, password, displayName })
        await user.save()
        return res.status(status.CREATED).send({
            token: await exports.generateToken(user),
            refreshToken: await exports.generateRefreshToken(user, true),
            user: {
                email,
                displayName
            }
        })
    } catch (err) {
        console.log(err)
        return res.send(ERR_SIGNUP)
    }
}

exports.login = async(req, res) => {
    const { email, displayName } = req.user
    return res.status(status.ACCEPTED).json({
        token: await exports.generateToken(req.user),
        refreshToken: await exports.generateRefreshToken(req.user, true),
        user: {
            email,
            displayName
        }
    })
}

exports.refreshToken = async(req, res) => {
    try {
        if (!req.body.hasOwnProperty("refreshToken")) return res.status(status.UNAUTHORIZED).send(ERR_INVALID_RTK)

        let { refreshToken } = req.body
        const refresh = await RefreshToken.findOne({ token: refreshToken })
        const user = await User.findById(refresh.user)
        const { email, displayName } = user
        if (!refresh || !refresh.isActive) return res.status(status.UNAUTHORIZED).send(ERR_INVALID_RTK)

        const newToken = await exports.generateRefreshToken(user, false)
        refresh.revoked = moment.utc().valueOf()
        refresh.replacedByToken = newToken.token
        await refresh.save()
        await newToken.save()
        return res.status(status.ACCEPTED).send({
            token: exports.generateToken(user),
            refreshToken: newToken.token,
            user: {
                email,
                displayName
            }
        })
    } catch (err) {
        console.log(err)
        return res.send(ERR_INVALID_RTK)
    }
}

exports.logout = async(req, res) => {
    const token = req.headers.authorization.replace('bearer ', '')
    const user = req.user.id

    try {
        if (req.body.hasOwnProperty("refreshToken")) {
            let { refreshToken } = req.body
            await RefreshToken.deleteOne({ token: refreshToken })
        }
        const data = await redisUtils.getUser(user)
        if (data !== null) {
            const parsedData = JSON.parse(data)
            parsedData[user].push(token)
            redisUtils.setExpire(user, JSON.stringify(parsedData[user]))
            return res.status(status.OK).send(LOGOUT_SUCCESS)
        }
        const blacklistData = {
            [user]: [token]
        }
        await redisUtils.setExpire(user, JSON.stringify(blacklistData))
        return res.status(status.OK).send(LOGOUT_SUCCESS)
    } catch (err) {
        console.log(err)
        return res.send(ERR_LOGOUT)
    }
}