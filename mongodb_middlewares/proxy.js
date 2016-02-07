var Client = require('../models/client');
var NotFoundError = require('../exceptions/notFoundError');

var fillClientCredentials = function(req, res, next) {
  var grant = req.body['grant_type'];
  var client_id = req.body['client_id'];
  var client_secret = req.body['client_secret'];
  var auth = req.headers['authorization'];
  var isBasicAuth = false;

  if (auth != null && auth.indexOf('Basic') >= 0) {
    isBasicAuth = true;
  }

  if (client_id && !client_secret && !isBasicAuth) {
    Client.findOneAsync({
      name: client_id
    })
    .then(function(client) {
      // No client found with that id
      if (!client) {
        throw new NotFoundError();
      }
      // Add secret key to request
      req.body['client_secret'] = client.secret;
    })
    .nodeify(function(err, result) {
      if (!err) {
        next(null, result, { scope: '*' });
      }
      else if (err instanceof NotFoundError) {
        next(null, false);
      }
      else {
        next(err);
      }
    });
  }
  else {
    return next();
  }
}

exports.fillClientCredentials = fillClientCredentials;
