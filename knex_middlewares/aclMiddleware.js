var Promise = require('bluebird');
var User = require('../models/userModel').User;
var Token = require('../models/tokenModel').Token;
var Policy = require('../models/policyModel').Policy;
var UserRole = require('../models/userRoleModel').UserRole;
var NotFoundError = require('../exceptions/notFoundError');
var AclNotFoundError = require('../exceptions/aclNotFoundError');
var headerHelper = require('../utils/headerParser');

var isAllowed = function(resource, permission) {
  return function(req, res, callback) {
    if (!permission) {
      permission = req.method;
    }

    getUserId(req)
    .then(function(userId) {
      return Policy.forge().fetchAllByUserId(userId);
    })
    .then(function(policies) {
      for (var key in policies) {
        var policy = policies[key];
        if (policy.get('resourceId').toLowerCase() === resource.toLowerCase() && policy.get('permissionId').toLowerCase() === permission.toLowerCase()) {
          return callback(null, true);
        }
      }
      throw new AclNotFoundError();
    })
    .catch(function(err) {
      return callback(err);
    });
  }
}

var getUserId = function(req) {
  var user = null;
  var bearerToken = null;
  var credentials = headerHelper.getBasicAuthentication(req);

  return new Promise(function(resolve, reject) {
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
        resolve(token.get('userId'));
      })
      .catch(function(err) {
        reject(err);
      });
    }
    else {
      User.forge()
      .where({
        username: credentials['username']
      })
      .fetch()
      .bind({})
      .then(function(user) {
        this.user = user;
        if (!user) {
          throw new NotFoundError();
        }
        return user.verifyPassword(credentials['password']);
      })
      .then(function(isMatch) {
        if (!isMatch) {
          throw new NotFoundError();
        }
        resolve(this.user.get('id'));
      })
      .catch(function(err) {
        reject(err);
      });
    }
  });
}

exports.isAllowed = isAllowed;
