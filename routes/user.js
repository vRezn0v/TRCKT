const router = require('express').Router()
const status = require('http-status-codes').StatusCodes

const { requireAuth } = require('../middleware/passport')

router.get('/current', requireAuth, (req, res) => {
    const { displayName, email } = req.user
    res.status(status.OK).json({ user: { displayName, email } })
})

module.exports = router