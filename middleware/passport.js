const passport = require('passport')
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt')
const LocalStrategy = require('passport-local')
const jwt = require('jwt-simple')

const User = require('../models/User')
const config = require('../config')
const { authSecret } = require('../config')
const { replaceOne } = require('../models/User')

const redisClient = require('redis').createClient()

const localOptions = { usernameField: "email" }


const localLogin = new LocalStrategy(localOptions, async(email, password, done) => {
    try {
        const user = await User.findOne({ email })
        if (!user) return done(err, false)
        var isMatch = await user.comparePassword(password)
        if (isMatch) return done(null, user)
        return done(null, false)

    } catch (err) {
        console.log(err)
    }
})

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken('authorization'),
    secretOrKey: config.authSecret
}

const jwtLogin = new JwtStrategy(jwtOptions, async(payload, done) => {
    const token = jwt.encode(payload, authSecret)

    try {
        const user = await User.findById(payload.sub)
        if (user) {
            redisClient.get(user.id, (err, data) => {
                if (err) return done(err, false)
                if (data != null) {
                    const parsedData = JSON.parse(data)
                    if (parsedData[user.id].includes(token)) return done(null, false)
                }
            })
            return done(null, user)
        }
        return done(null, false)
    } catch (err) {
        console.log(err)
    }

    /*User.findById(payload.sub, (err, user) => {
        if (err) return done(err, false)
        if (user) {
            client.get(user.id, (err, data) => {
                if (err) return done(err, false)
                if (data != null) {
                    const parsedData = JSON.parse(data)
                    if (parsedData[user.id].includes(token)) return done(null, false)
                }
            })
            return done(null, user)
        }
        return done(null, false)
    })*/
})

passport.use(jwtLogin)
passport.use(localLogin)

module.exports = {
    requireLogin: passport.authenticate('local', { session: false }),
    requireAuth: passport.authenticate('jwt', { session: false })
}