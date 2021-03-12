const router = require('express').Router()

const { requireAuth } = require('../middleware/passport')

router.get('/current', requireAuth, (req, res) => {
    const { displayName, email } = req.user
    res.status(200).json({ user: { displayName, email } })
})

module.exports = router