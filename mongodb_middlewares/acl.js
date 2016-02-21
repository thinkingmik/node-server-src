var User = require('../models/user');
var Token = require('../models/token');
var headerHelper = require('../utils/headerParser');

var isAllowed = function(resource, permission) {
  return function(req, res, next) {
    var isBearerAuth = false;
    var credentials = headerHelper.getBasicAuthentication(req);
    if (credentials == null) {
      isBearerAuth = true;
      credentials = headerHelper.getBearerToken(req);
    }


    next();
  }
}

exports.isAllowed = isAllowed;
