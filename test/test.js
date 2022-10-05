let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();


chai.use(chaiHttp);

let token = "";
let refreshToken = ""

let defaultLogin = {
    'username': 'testeradmin',
    'password': 'tester'
}

let updatedUser = {
    'username': 'admin',
    'password': 'tester'
}
// parent block
describe("Signup,Login,Get,Patch,Delete User and get RefreshToken", () => {
    describe("/signup user", () => {
        it('should Register user, login user, check token and get user with username', function (done) {
            chai.request('http://localhost:8080')
                .post('/signup')

                .send(defaultLogin)
                .end((err, res) => { // when we get a response from the endpoint
                    res.should.have.status(200);

                    // follow up with login
                    chai.request('http://localhost:8080')
                        .post('/login')
                        // send user login details
                        .send(defaultLogin)
                        .end((err, res) => {
                            console.log('this runs the login part');
                            res.body.should.have.property('accessToken');
                            token = res.body.accessToken;
                            refreshToken = res.body.refreshToken;

                            // follow up with requesting user protected page
                            chai.request('http://localhost:8080')
                                .get('/user/testeradmin')
                                .set('Authorization', 'JWT ' + token)
                                .end(function (err, res) {
                                    res.should.have.status(200);
                                    done();
                                });
                        })
                })
        })
    })
    describe("/Update user", () => {
        it('should update user details', function (done) {
            chai.request('http://localhost:8080')
                .patch('/user/testeradmin')
                .send(updatedUser)
                .set('Authorization', 'JWT ' + token)
                .end((err, res) => { // when we get a response from the endpoint
                    res.should.have.status(200);
                    done();
                });
        })
    })
    describe("/RefreshToken ", () => {
        it('should get a new access token and refresh token', function (done) {
            chai.request('http://localhost:8080')
                .post('/refreshToken')
                .send({ 'token': refreshToken })
                .end((err, res) => { // when we get a response from the endpoint
                    res.should.have.status(200);
                    res.body.should.have.property('accessToken');
                    token = res.body.accessToken;
                    refreshToken = res.body.refreshToken;
                    done();
                });
        })
    })

    describe("/Delete user", () => {
        it('should delete user with updated username', function (done) {
            chai.request('http://localhost:8080')
                .delete('/user/admin')
                .set('Authorization', 'JWT ' + token)
                .end((err, res) => { // when we get a response from the endpoint
                    res.should.have.status(200);
                    res.body.deletedCount.should.be.eql(1);
                    done();
                });
        })
    })
})