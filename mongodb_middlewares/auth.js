var passport = require('passport');
var jwt = require('jsonwebtoken');
var BasicStrategy = require('passport-http').BasicStrategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var ClientPasswordStrategy  = require('passport-oauth2-client-password').Strategy;
var Promise = require('bluebird');
var headerHelper = require('../utils/headerParser');
var User = require('../models/user');
var Client = require('../models/client');
var Token = require('../models/token');
var config = require('../configs/config')[process.env.NODE_ENV];
var NotFoundError = require('../exceptions/notFoundError');
var ExpiredTokenError = require('../exceptions/expiredTokenError');

//Basic authentication
passport.use('basic', new BasicStrategy(
  function(username, password, callback) {
    User.findOneAsync({
      username: username
    })
    .bind({})
    .then(function(user) {
      this.user = user;
      // No user found with that username
      if (!user) {
        throw new NotFoundError();
      }
      // Make sure the password is correct
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
    Client.findOneAsync({
      name: clientId
    })
    .then(function(client) {
      // No client found with that id or bad password
      if (!client || client.secret !== clientSecret) {
        return false;
      }
      // Success
      return client;
    })
    .nodeify(callback);
  }
));

//Client authentication with credentials into body
passport.use('client-password', new ClientPasswordStrategy(
  function(clientId, clientSecret, callback) {
    Client.findOneAsync({
      name: clientId
    })
    .then(function(client) {
      // No client found with that id or bad password
      if (!client || client.secret !== clientSecret) {
        return false;
      }
      // Success
      return client;
    })
    .nodeify(callback);
  }
));

//Bearer authentication
passport.use('bearer', new BearerStrategy({ passReqToCallback: true },
  function(req, accessToken, callback) {
    Token.findOneAsync({
      value: accessToken
    })
    .bind({})
    .then(function(token) {
      this.token = token;

      // No token found
      if (!token) {
        throw new NotFoundError();
      }

      // Check token expiration if it isn't jwt
      if (config.jwt.enabled === false && Math.round((Date.now() - this.token.created) / 1000) > config.tokenLife) {
        return false;
      }

      // Check jwt token
      if (config.jwt.enabled === true) {
        return verifyJwtTokenAsync(req, token);
      }

      return true;
    })
    .then(function(isValidToken) {
      if (isValidToken === false) {
        return Token.removeAsync({
          value: this.token.value
        });
      }

      return {
        result: {
          'ok': 0,
          'n': 0
        }
      };
    })
    .then(function(ret) {
      if (ret.result.ok === 1) {
        throw new ExpiredTokenError();
      }
    })
    .then(function() {
      var arr = [null, null];
      if (this.token._user != null) {
        var user = User.findOneAsync({
          _id: this.token._user
        });
        arr = [null, user];
      }
      else {
        var client = Client.findOneAsync({
          _id: this.token._client
        });
        arr = [client, null];
      }
      return arr;
    })
    .spread(function(client, user) {
      if (!client && !user) {
        throw new NotFoundError();
      }
      return (!client) ? user : client;
    })
    .nodeify(function(err, result) {
      if (!err) {
        callback(null, result, { scope: '*' });
      }
      else if (err instanceof NotFoundError) {
        callback(null, false);
      }
      else if (err instanceof ExpiredTokenError) {
        callback(null, false);
      }
      else {
        callback(err);
      }
    });
  }
));

//Verify if JWT is valid
var verifyJwtTokenAsync = function (req, token) {
  return new Promise(function(resolve, reject) {
    var secret = config.jwt.secretKey;
    if (config.jwt.cert != null) {
      secret = fs.readFileSync(config.jwt.cert);
    }

    jwt.verify(token.value, secret, { ignoreExpiration: false }, function(err, decoded) {
      if (!err) {
        var ipAddress = headerHelper.getIP(req);
        var userAgent = headerHelper.getUA(req);

        if ((decoded.bua == null || decoded.bua == userAgent) && (config.jwt.ipcheck === false || decoded.ipa == ipAddress)) {
          resolve(true);
        }

        reject(new NotFoundError());
      }
      else if (err.name && err.name == 'TokenExpiredError') {
        resolve(false);
      }
      else {
        reject(err);
      }
    });
  });
}

//Export endpoints
exports.isAuthenticated = passport.authenticate(['basic', 'bearer'], { session: false });
exports.isClientAuthenticated = passport.authenticate(['client-basic', 'client-password'], { session: false });
