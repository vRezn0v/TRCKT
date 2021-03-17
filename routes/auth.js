const router = require('express').Router()

const Authentication = require('../controller/authentication')

const { requireLogin, requireAuth } = require('../middleware/passport')

router.post('/signup', Authentication.signup)
router.post('/login', requireLogin, Authentication.login)
router.post('/refresh', Authentication.refreshToken)


router.post('/logout', requireAuth, Authentication.logout)

module.exports = router