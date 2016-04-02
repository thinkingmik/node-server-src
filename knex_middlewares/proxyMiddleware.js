var Client = require('../knex_models/clientModel');
var NotFoundError = require('../exceptions/notFoundError');

var fillClientCredentials = function(req, res, callback) {
  var grant = req.body['grant_type'];
  var clientId = req.body['client_id'];
  var clientSecret = req.body['client_secret'];
  var auth = req.headers['authorization'];
  var isBasicAuth = false;

  if (auth != null && auth.indexOf('Basic') >= 0) {
    isBasicAuth = true;
  }

  if (clientId && !clientSecret && !isBasicAuth) {
    Client.findOne({
      name: clientId
    })
    .then(function(client) {
      if (!client) {
        throw new NotFoundError();
      }
      // Add secret key to request
      req.body['client_secret'] = 'client123';//client.get('secret');
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
  else {
    return callback();
  }
}

exports.fillClientCredentials = fillClientCredentials;