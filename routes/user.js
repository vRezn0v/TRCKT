const router = require('express').Router()

const { requireAuth } = require('../middleware/passport')

router.get('/current', requireAuth, (req, res) => {
    const { displayName, email } = req.user
    res.json({ user: { displayName, email } })
})

module.exports = router