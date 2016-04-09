var User = require('../models/userModel').User;
var Token = require('../models/tokenModel').Token;
var headerHelper = require('../utils/headerParser');

var isAllowed = function(resource, permission) {
  return function(req, res, callback) {
    var isBearerAuth = false;
    var credentials = headerHelper.getBasicAuthentication(req);
    if (credentials == null) {
      isBearerAuth = true;
      credentials = headerHelper.getBearerToken(req);
    }


    callback();
  }
}

exports.isAllowed = isAllowed;
