const chai = require('chai')
const { should, expect, assert } = require('chai')
const { generateToken, generateRefreshToken, login } = require('../controller/authentication')

const status = require('http-status-codes').StatusCodes
var chaiHttp = require('chai-http')
var app = require('../app')

chai.use(chaiHttp)

const user = {
    id: "123456789",
    email: "user123@trckt.io",
    password: "nullv0id",
    displayName: "mockuser"
}

const response = {
    status: s => this.status = s,
    json: j => this.json = j
}


describe('Authentication Helper Methods', () => {
    it('JWT Generator Returns Token', done => {
        assert.equal(typeof generateToken(user), 'string')
        done()
    })
    it('Refresh Token Generator Returns String', done => {
        generateRefreshToken(user, true).then(data => {
            assert.equal(typeof data, 'string')
        })
        done()
    })
    it('Refresh Token Generator Returns Object', done => {
        generateRefreshToken(user, false).then(data => {
            assert.equal(typeof data, 'object')
        })
        done()
    })
})

describe('Authentication Routes', () => {
    it('Successful Login Returns User Object', done => {
            chai,
            request(app)
            .post('/auth/login')
            .send({
                email: "rzwshre@jwt.io",
                password: "@ThisIsAPassWord1230"
            })
            .end((err, res) => {
                res.should.have.status(status.OK)
                res.should.be.json
                done()
            })
        }),
        it('')
})