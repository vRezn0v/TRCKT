const router = require('express').Router()

const Authentication = require('../controller/authentication')

const { requireLogin } = require('../middleware/passport')

router.post('/signup', Authentication.signup)
router.post('/login', requireLogin, Authentication.login)

module.exports = router