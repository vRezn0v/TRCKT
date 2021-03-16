const redis = require('redis')
const { EXPIRE } = require('./constants/constants')

var dummyClient = {
    get: function(key, callback) {
        callback(null, null)
    },
    setex: function(key, time, value) {
        return
    }
}

var connectionString = process.env.REDIS_URI || 'redis://localhost:6379'
var client = redis.createClient(connectionString, {})

client.on('ready', function() {
    console.log("[+] Redis Connected")
})

client.on('error', () => {
    console.log("[-] Cache Server Failed, Falling Back to Failsafe")
    client = Object.assign({}, dummyClient)
})

module.exports.redisUtils = {
    getUser: (user) => {
        return new Promise((resolve, reject) => {
            client.get(user, (err, data) => {
                console.log(data)
                if (err) return reject(err)
                return resolve(data)
            })
        })
    },
    setExpire: async(user, data) => {
        try {
            if (typeof data === Object) { data = data[user] }
            console.log(client)
            await client.setex(user, EXPIRE, data)
        } catch (err) {
            console.log(err)
        }
    }
}