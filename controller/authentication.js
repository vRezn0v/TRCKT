const jwt = require('jwt-simple')

const User = require('../models/User')
const config = require('../config')

const redisClient = require('redis').createClient()

const moment = require('moment')
const { ensureIndexes } = require('../models/User')
const EXPIRE = 3600

const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(String(email).toLowerCase())
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

        if (!email || !validateEmail(email) || !password || password.length < 6 || !displayName || displayName.length < 3)
            return res.status(422).send("Provide Valid Credentials.")

        var existingUser = await User.findOne({ email })
        if (existingUser) return res.status(422).send("Email Already In Use.")

        const user = new User({ email, password, displayName })
        await user.save()
        res.status(201).send({
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
    res.json({
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
        await redisClient.get(user, (err, data) => {
            if (err) res.send({ err })
            if (data !== null) {
                const parsedData = JSON.parse(data)
                parsedData[user].push(token)
                redisClient.setex(user, 3600, JSON.stringify(parsedData))
            }
            const blacklistData = {
                [user]: [token]
            }
            redisClient.setex(user, 3600, JSON.stringify(blacklistData))
        })
    } catch (err) {
        console.log(err)
    }
}