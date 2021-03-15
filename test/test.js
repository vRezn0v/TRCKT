const { assert } = require('chai')
var chai = require('chai')
var chaiHttp = require('chai-http')
var app = require('../app')
var should = chai.should()


chai.use(chaiHttp)

// 1 test per thing
// mock data .js

describe('Endpoint Tests', function() {
    beforeEach(function(done) {
        chai.request(app)
            .post('/auth/login')
            .send({
                "email": "tester@trckt.com",
                "password": "xX_password_Xx",
            })
            .end((err, res) => {
                res.should.have.status(200)
                res.should.be.json
                this.token = res.body.token
                done()
            })
    })
    it('Give Error if Not Logged In', function(done) {
        chai.request(app)
            .get('/api/user/current')
            .end((err, res) => {
                res.should.have.status(401)
                done()
            })
    })

    it('Return User Object when User Logged in', function(done) {
        chai.request(app)
            .get('/api/user/current')
            .set('Authorization', `bearer ${this.token}`)
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.have.property("user")
                done()
            })
    })

    it('No Access To Tasks Endpoint without token',
        function(done) {
            chai.request(app)
                .get('/api/tasks')
                .end((err, res) => {
                    res.should.have.status(401)
                    done()
                })
        })

    it('Return an Array of Lists with Token',
        function(done) {
            chai.request(app)
                .get('/api/tasks')
                .set('Authorization', `bearer ${this.token}`)
                .end((err, res) => {
                    res.should.have.status(200)
                    assert.equal(typeof res.body, 'object')
                    done()
                })
        })
})