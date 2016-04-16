var server = require('../server');
var config = require('../configs/config');
var cheerio = require('cheerio')
var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var supertest = require('supertest');
var api = supertest('http://localhost:' + config.port);

var tokenEndpoint = '/oauth2/token';
var usersEndpoint = '/users';
var accessToken = '';
var refreshToken = '';
var transactionId = '';
var code = '';
var cookie = null;

// OAuth2 client credentials grant
describe('Client Credentials', function() {
  it('should return an unsupported grant type', function(done) {
    api.post(tokenEndpoint)
      .auth('dashboard', 'dashboard123')
      .send({
        grant_type: 'fake',
        scope: '*'
      })
      .set('Accept', 'application/x-www-form-urlencoded')
      .expect(501)
      .end(done);
  });
  it('should return an unauthorized code', function(done) {
    api.post(tokenEndpoint)
      .auth('dashboard', 'fake')
      .send({
        grant_type: 'client_credentials',
        scope: '*'
      })
      .set('Accept', 'application/x-www-form-urlencoded')
      .expect(401)
      .end(done);
  });
  it('should return an access token (with basic authentication)', function(done) {
    api.post(tokenEndpoint)
      .auth('dashboard', 'dashboard123')
      .send({
        grant_type: 'client_credentials',
        scope: '*'
      })
      .set('Accept', 'application/x-www-form-urlencoded')
      .expect(200)
      .expect(function(res) {
        expect(res.body).to.have.property('access_token');
        expect(res.body).to.have.property('refresh_token');
        expect(res.body).to.have.property('expires_in');
        expect(res.body).to.have.property('token_type');
        accessToken = res.body.access_token;
        refreshToken = res.body.refresh_token;
      })
      .end(done);
  });
  it('should return an access token', function(done) {
    api.post(tokenEndpoint)
      .auth('dashboard', 'dashboard123')
      .send({
        grant_type: 'client_credentials',
        client_id: 'dashboard',
        client_secret: 'dashboard123',
        scope: '*'
      })
      .set('Accept', 'application/x-www-form-urlencoded')
      .expect(200)
      .expect(function(res) {
        expect(res.body).to.have.property('access_token');
        expect(res.body).to.have.property('refresh_token');
        expect(res.body).to.have.property('expires_in');
        expect(res.body).to.have.property('token_type');
        accessToken = res.body.access_token;
        refreshToken = res.body.refresh_token;
      })
      .end(done);
  });
  it('should return a success message', function(done) {
    api.get(usersEndpoint)
      .set('Authorization', 'bearer ' + accessToken)
      .expect(200)
      .end(done);
  });
  it('should return an invalid access token error', function(done) {
    api.get(usersEndpoint)
      .set('Authorization', 'bearer fake')
      .expect(401)
      .end(done);
  });
});

// OAuth2 authorization code grant
describe('Authorization Code', function() {
  it('should return an unsupported grant type', function(done) {
    api.get('/oauth2/authorize?client_id=client&response_type=fake&redirect_uri=http://localhost:3000')
      .auth('admin', 'admin123')
      .expect(501)
      .end(done);
  });
  it('should return a bad request (missing parameters)', function(done) {
    api.get('/oauth2/authorize')
      .auth('admin', 'admin123')
      .expect(400)
      .end(done);
  });
  it('should return a web page dialog', function(done) {
    api.get('/oauth2/authorize?client_id=dashboard&response_type=code&redirect_uri=http://localhost:3000')
      .auth('admin', 'admin123')
      .expect(200)
      .expect(function(res) {
        var $ = cheerio.load(res.text);
        cookie = res.headers['set-cookie'][0];
        transactionId = $('#transaction').val();
      })
      .end(done);
  });
  it('should redirect to the defined URI with an access denied error', function(done) {
    api.post('/oauth2/authorize')
      .auth('admin', 'admin123')
      .set('Accept', 'application/x-www-form-urlencoded')
      .set('Cookie', cookie)
      .send({
        transaction_id: transactionId,
        cancel: 'Deny'
      })
      .expect(302)
      .expect(function(res) {
        var location = res.headers['location'];
        expect(location).to.contain('error');
      })
      .end(done);
  });
  it('should redirect to the defined URI with a code to exchange', function(done) {
    api.get('/oauth2/authorize?client_id=dashboard&response_type=code&redirect_uri=http://localhost:3000')
      .auth('admin', 'admin123')
      .expect(200)
      .expect(function(res) {
        var $ = cheerio.load(res.text);
        cookie = res.headers['set-cookie'][0];
        transactionId = $('#transaction').val();
      })
      .end(function(err, res) {
        api.post('/oauth2/authorize')
          .auth('admin', 'admin123')
          .set('Accept', 'application/x-www-form-urlencoded')
          .set('Cookie', cookie)
          .send({
            transaction_id: transactionId
          })
          .expect(302)
          .expect(function(res) {
            var location = res.headers['location'];
            expect(location).to.contain('code');
            code = location.split('=')[1];
          })
          .end(done);
      });
  });
  it('should return an access token', function(done) {
    api.post(tokenEndpoint)
      .auth('dashboard', 'dashboard123')
      .send({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: 'http://localhost:3000'
      })
      .set('Accept', 'application/x-www-form-urlencoded')
      .expect(200)
      .expect(function(res) {
        expect(res.body).to.have.property('access_token');
        expect(res.body).to.have.property('refresh_token');
        expect(res.body).to.have.property('expires_in');
        expect(res.body).to.have.property('token_type');
        accessToken = res.body.access_token;
        refreshToken = res.body.refresh_token;
      })
      .end(done);
  });
  it('should return a success message', function(done) {
    api.get(usersEndpoint)
      .set('Authorization', 'bearer ' + accessToken)
      .expect(200)
      .end(done);
  });
});

// OAuth2 resource owner password credentials grant with proxy
describe('User Credentials (behind proxy, no client secret)', function() {
  it('should return an unsupported grant type', function(done) {
    api.post(tokenEndpoint)
      .send({
        grant_type: 'password_fake',
        client_id: 'dashboard',
        username: 'admin',
        password: 'admin123',
        scope: '*'
      })
      .set('Accept', 'application/x-www-form-urlencoded')
      .expect(501)
      .end(done);
  });
  it('should return an unauthorized code', function(done) {
    api.post(tokenEndpoint)
      .send({
        grant_type: 'password',
        client_id: 'fake',
        username: 'admin',
        password: 'admin123',
        scope: '*'
      })
      .set('Accept', 'application/x-www-form-urlencoded')
      .expect(401)
      .end(done);
  });
  it('should return an access token', function(done) {
    api.post(tokenEndpoint)
      .send({
        grant_type: 'password',
        client_id: 'dashboard',
        username: 'admin',
        password: 'admin123',
        scope: '*'
      })
      .set('Accept', 'application/x-www-form-urlencoded')
      .expect(200)
      .expect(function(res) {
        expect(res.body).to.have.property('access_token');
        expect(res.body).to.have.property('refresh_token');
        expect(res.body).to.have.property('expires_in');
        expect(res.body).to.have.property('token_type');
        accessToken = res.body.access_token;
        refreshToken = res.body.refresh_token;
      })
      .end(done);
  });
  it('should return a success message', function(done) {
    api.get(usersEndpoint)
      .set('Authorization', 'bearer ' + accessToken)
      .expect(200)
      .end(done);
  });
  it('should return an invalid access token error', function(done) {
    api.get(usersEndpoint)
      .set('Authorization', 'bearer fake')
      .expect(401)
      .end(done);
  });
});

// OAuth2 resource owner password credentials grant
describe('User Credentials', function() {
  it('should return an unsupported grant type', function(done) {
    api.post(tokenEndpoint)
      .auth('dashboard', 'dashboard123')
      .send({
        grant_type: 'password_fake',
        username: 'admin',
        password: 'admin123',
        scope: '*'
      })
      .set('Accept', 'application/x-www-form-urlencoded')
      .expect(501)
      .end(done);
  });
  it('should return an unauthorized code', function(done) {
    api.post(tokenEndpoint)
      .auth('dashboard', 'client1234')
      .send({
        grant_type: 'password',
        username: 'admin',
        password: 'user1234',
        scope: '*'
      })
      .set('Accept', 'application/x-www-form-urlencoded')
      .expect(401)
      .end(done);
  });
  it('should return an access token (with basic authentication)', function(done) {
    api.post(tokenEndpoint)
      .auth('dashboard', 'dashboard123')
      .send({
        grant_type: 'password',
        username: 'admin',
        password: 'admin123',
        scope: '*'
      })
      .set('Accept', 'application/x-www-form-urlencoded')
      .expect(200)
      .expect(function(res) {
        expect(res.body).to.have.property('access_token');
        expect(res.body).to.have.property('refresh_token');
        expect(res.body).to.have.property('expires_in');
        expect(res.body).to.have.property('token_type');
        accessToken = res.body.access_token;
        refreshToken = res.body.refresh_token;
      })
      .end(done);
  });
  it('should return an access token', function(done) {
    api.post(tokenEndpoint)
      .send({
        grant_type: 'password',
        client_id: 'dashboard',
        client_secret: 'dashboard123',
        username: 'admin',
        password: 'admin123',
        scope: '*'
      })
      .set('Accept', 'application/x-www-form-urlencoded')
      .expect(200)
      .expect(function(res) {
        expect(res.body).to.have.property('access_token');
        expect(res.body).to.have.property('refresh_token');
        expect(res.body).to.have.property('expires_in');
        expect(res.body).to.have.property('token_type');
        accessToken = res.body.access_token;
        refreshToken = res.body.refresh_token;
      })
      .end(done);
  });
  it('should return a success message', function(done) {
    api.get(usersEndpoint)
      .set('Authorization', 'bearer ' + accessToken)
      .expect(200)
      .end(done);
  });
  it('should return an invalid access token error', function(done) {
    api.get(usersEndpoint)
      .set('Authorization', 'bearer fake')
      .expect(401)
      .end(done);
  });
});

// OAuth2 refresh token grant
describe('Refresh Token', function() {
  it('should return a new access token', function(done) {
    api.post(tokenEndpoint)
      .send({
        grant_type: 'password',
        client_id: 'dashboard',
        client_secret: 'dashboard123',
        username: 'admin',
        password: 'admin123',
        scope: '*'
      })
      .set('Accept', 'application/x-www-form-urlencoded')
      .expect(200)
      .expect(function(res) {
        accessToken = res.body.access_token;
        refreshToken = res.body.refresh_token;
      })
      .end(function(err, res) {
        api.post(tokenEndpoint)
          .auth('dashboard', 'dashboard123')
          .send({
            grant_type: 'refresh_token',
            refresh_token: refreshToken
          })
          .set('Accept', 'application/x-www-form-urlencoded')
          .expect(200)
          .expect(function(res) {
            expect(res.body).to.have.property('access_token');
            expect(res.body).to.have.property('refresh_token');
            expect(res.body).to.have.property('expires_in');
            expect(res.body).to.have.property('token_type');
            accessToken = res.body.access_token;
            refreshToken = res.body.refresh_token;
          })
          .end(done);
      });
  });
  it('should return a success message', function(done) {
    api.get(usersEndpoint)
      .set('Authorization', 'bearer ' + accessToken)
      .expect(200)
      .end(done);
  });
  it('should return an invalid refresh token error', function(done) {
    api.post(tokenEndpoint)
      .auth('dashboard', 'dashboard123')
      .send({
        grant_type: 'refresh_token',
        refresh_token: 'fake'
      })
      .set('Accept', 'application/x-www-form-urlencoded')
      .expect(403)
      .end(done);
  });
});

// Basic authentication
describe('Basic Authentication', function() {
  it('should return a success message', function(done) {
    api.get(usersEndpoint)
      .auth('admin', 'admin123')
      .expect(200)
      .end(done);
  });
  it('should return an unauthorized code', function(done) {
    api.get(usersEndpoint)
      .auth('admin', 'user1234')
      .expect(401)
      .end(done);
  });
});
