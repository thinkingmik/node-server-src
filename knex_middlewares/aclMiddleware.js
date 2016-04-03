var User = require('../models/userModel');
var Token = require('../models/tokenModel');
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
