const passport = require('passport')
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt')
const LocalStrategy = require('passport-local')

const User = require('../models/User')
const config = require('../config')

const localOptions = { usernameField: "email" }

const localLogin = new LocalStrategy(localOptions, (email, password, done) => {
    User.findOne({ email: email }, (err, user) => {
        if (err) return done(err, false)
        if (!user) return done(null, false)
        user.comparePassword(password, (err, isMatch) => {
            if (err) return done(err)
            if (isMatch) return done(null, user)
            return done(null, false)
        })
    })
})

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken('authorization'),
    secretOrKey: config.authSecret
}

const jwtLogin = new JwtStrategy(jwtOptions, (payload, done) => {
    User.findById(payload.sub, (err, user) => {
        if (err) return done(err, false)
        if (user) return done(null, user)
        return done(null, false)
    })
})

passport.use(jwtLogin)
passport.use(localLogin)

module.exports = {
    requireLogin: passport.authenticate('local', { session: false }),
    requireAuth: passport.authenticate('jwt', { session: false })
}