var User = require('../models/userModel').User;
var Token = require('../models/tokenModel').Token;
var User = require('../models/userModel').User;
var NotFoundError = require('../exceptions/notFoundError');
var headerHelper = require('../utils/headerParser');

var isAllowed = function(resource, permission) {
  return function(req, res, callback) {
    var user = null;
    var bearerToken = null;
    var credentials = headerHelper.getBasicAuthentication(req);

    if (credentials == null) {
      bearerToken = headerHelper.getBearerToken(req);
      Token.forge()
      .where({
        token: bearerToken
      })
      .fetch()
      .then(function(token) {
        if (!token) {
          throw new NotFoundError();
        }
        return callback();
      })
      .catch(function(err) {
        return callback(err);
      });
    }
    else {
      User.forge()
      .where({
        username: credentials['username']
      })
      .fetch()
      .then(function(user) {
        if (!user) {
          throw new NotFoundError();
        }
        return callback();
      })
      .catch(function(err) {
        return callback(err);
      });
    }
  }
}

exports.isAllowed = isAllowed;
