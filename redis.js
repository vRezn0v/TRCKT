var redis = require('redis')

var redisClient = (function() {
    // dummy client
    var fake = {
        get: function(key, callback) {
            callback(null, null)
        },
        setex: function(key, time, value) {
            return
        }
    }
    var client = Object.assign({}, fake)

    var connectionString = process.env.REDIS_URI || 'redis://localhost:6379'
    var c = redis.createClient(connectionString, {})

    c.on('ready', function() {
        client = Object.assign({}, c)
    })

    c.on('error', () => {
        client = Object.assign({}, fake)
    })

    var getClient = () => {
        return client
    }

    return {
        getClient
    }
})()

module.exports = redisClient