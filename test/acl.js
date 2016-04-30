var server = require('../server');
var config = require('../configs/config')[process.env.NODE_ENV];
var cheerio = require('cheerio')
var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var supertest = require('supertest');
var api = supertest('http://localhost:' + config.port);

var tokenEndpoint = '/oauth2/token';
var usersEndpoint = '/users';
var accessToken = '';
var cookie = null;

// ACL with bearer token authentication
describe('Get a protected resource with bearer token authentication', function() {
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
  it('should return the requested resource', function(done) {
    api.get(usersEndpoint)
      .set('Authorization', 'bearer ' + accessToken)
      .expect(200)
      .end(done);
  });
});

// ACL with basic authentication
describe('Get a protected resource with basic authentication', function() {
  it('should return the requested resource', function(done) {
    api.get(usersEndpoint)
      .auth('admin', 'admin123')
      .expect(200)
      .end(done);
  });
});
