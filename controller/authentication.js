const jwt = require('jwt-simple')

const User = require('../models/User')
const config = require('../config')

const client = require('redis').createClient()

const EXPIRE = 3600

const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(String(email).toLowerCase())
}



exports.generateToken = user => {
    const timestamp = Math.floor(new Date().getTime() / 1000)
    return jwt.encode({ iss: 'TRCKT', sub: user.id, iat: timestamp, exp: timestamp + EXPIRE },
        config.authSecret
    )
}

exports.signup = (req, res, next) => {
    const { email, password, displayName } = req.body

    if (!email || !validateEmail(email) || !password || password.length < 6 || !displayName || displayName.length < 3)
        return res.status(422).send({
            error: "Provide Valid Credentials."
        })

    User.findOne({ email: email }, (err, existingUser) => {
        if (err) return next(err)
        if (existingUser) return res.status(422).send({
            error: "Email Already In Use."
        })
    })

    const user = new User({ email, password, displayName })
    user.save((err, user) => {
        if (err) return next(err)
        const { email, displayName } = user

        res.status(201).send({
            token: exports.generateToken(user),
            user: {
                email,
                displayName
            }
        })
    })
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

exports.logout = (req, res) => {
    const token = req.headers.authorization.replace('bearer ', '')
    const user = req.user.id

    client.get(user, (err, data) => {
        if (err) res.send({ err })
        if (data !== null) {
            const parsedData = JSON.parse(data)
            parsedData[user].push(token)
            client.setex(user, 3600, JSON.stringify(parsedData))
            return res.send({
                status: 'success',
                message: "Logout Success"
            })
        }
        const blacklistData = {
            [user]: [token]
        }
        client.setex(user, 3600, JSON.stringify(blacklistData))
        return res.send({
            status: 'success',
            message: "Logout Success"
        })
    })
}