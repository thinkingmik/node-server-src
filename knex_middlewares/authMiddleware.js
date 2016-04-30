var passport = require('passport');
var jwt = require('jsonwebtoken');
var BasicStrategy = require('passport-http').BasicStrategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var ClientPasswordStrategy  = require('passport-oauth2-client-password').Strategy;
var Promise = require('bluebird');
var headerHelper = require('../utils/headerParser');
var User = require('../models/userModel');
var Client = require('../models/clientModel');
var Token = require('../models/tokenModel');
var config = require('../configs/config')[process.env.NODE_ENV];
var NotFoundError = require('../exceptions/notFoundError');
var ExpiredTokenError = require('../exceptions/expiredTokenError');

//Basic authentication
passport.use('basic', new BasicStrategy(
  function(username, password, callback) {
    User.forge()
    .where({
      username: username,
      enabled: true
    })
    .fetch({
      columns: ['id', 'username', 'email', 'firstName', 'lastName', 'password']
    })
    .bind({})
    .then(function(user) {
      this.user = user;
      if (!user) {
        throw new NotFoundError();
      }
      return user.verifyPassword(password);
    })
    .then(function(isMatch) {
      if (!isMatch) {
        throw new NotFoundError();
      }
      return this.user;
    })
    .nodeify(function(err, result) {
      if (!err) {
        callback(null, result);
      }
      else if (err instanceof NotFoundError) {
        callback(null, false);
      }
      else {
        callback(err);
      }
    });
  }
));

//Client authentication with credentials into header
passport.use('client-basic', new BasicStrategy(
  function(clientId, clientSecret, callback) {
    Client.forge()
    .where({
      name: clientId,
      enabled: true
    })
    .fetch({
      columns: ['id', 'name', 'secret', 'description', 'domain']
    })
    .bind({})
    .then(function(client) {
      if (!client || client.get('secret') !== clientSecret) {
        return false;
      }
      return client;
    })
    .nodeify(callback);
  }
));

//Client authentication with credentials into body
passport.use('client-password', new ClientPasswordStrategy(
  function(clientId, clientSecret, callback) {
    Client.forge().where({
      name: clientId,
      enabled: true
    })
    .fetch({
      columns: ['id', 'name', 'secret', 'description', 'domain']
    })
    .bind({})
    .then(function(client) {
      if (!client || client.get('secret') !== clientSecret) {
        return false;
      }
      return client;
    })
    .nodeify(callback);
  }
));

//Bearer authentication
passport.use('bearer', new BearerStrategy({ passReqToCallback: true },
  function(req, accessToken, callback) {
    Token.forge()
    .where({
      token: accessToken
    })
    .fetch({
      columns: ['id', 'token', 'refresh', 'userId', 'clientId', 'createdAt']
    })
    .bind({})
    .then(function(token) {
      this.token = token;
      if (!token) {
        throw new NotFoundError();
      }
      // Check token expiration if it isn't a jwt
      if (config.jwt.enabled === false && Math.round((Date.now() - this.token.get('createdAt')) / 1000) > config.tokenLife) {
        return false;
      }
      // Check jwt token
      if (config.jwt.enabled === true) {
        return verifyJwtToken(req, token);
      }
      return true;
    })
    .then(function(isValidToken) {
      if (isValidToken === false) {
        return this.token.destroy()
          .then(function() {
            throw new ExpiredTokenError();
          });
      }
      return isValidToken;
    })
    .then(function(ret) {
      if (this.token.get('userId') != null) {
        return User.forge()
          .where({
            id: this.token.get('userId'),
            enabled: true
          })
          .fetch({
            columns: ['id', 'username', 'password']
          });
      }
      else {
        return Client.forge()
          .where({
            id: this.token.get('clientId'),
            enabled: true
          })
          .fetch({
            columns: ['id']
          });
      }
    })
    .then(function(ret) {
      if (!ret) {
        throw new NotFoundError();
      }
      return ret;
    })
    .nodeify(function(err, result) {
      if (!err) {
        callback(null, result, { scope: '*' });
      }
      else if (err instanceof NotFoundError) {
        callback(null, false);
      }
      else {
        callback(err);
      }
    });
  }
));

//Verify if JWT is valid
var verifyJwtToken = function (req, token) {
  return new Promise(function(resolve, reject) {
    var secret = config.jwt.secretKey;
    if (config.jwt.cert !== null) {
      secret = fs.readFileSync(config.jwt.cert);
    }

    return jwt.verify(token.get('token'), secret, { ignoreExpiration: false }, function(err, decoded) {
      if (!err) {
        var ipAddress = headerHelper.getIP(req);
        var userAgent = headerHelper.getUA(req);

        if ((config.jwt.uacheck === false || decoded.bua === null || decoded.bua === userAgent) && (config.jwt.ipcheck === false || decoded.ipa === ipAddress)) {
          return resolve(true);
        }
        return reject(new NotFoundError());
      }
      else if (err.name && err.name === 'TokenExpiredError') {
        return resolve(false);
      }
      else {
        return reject(err);
      }
    });
  });
}

//Export endpoints
exports.isAuthenticated = passport.authenticate(['basic', 'bearer'], { session: false });
exports.isClientAuthenticated = passport.authenticate(['client-basic', 'client-password'], { session: false });
