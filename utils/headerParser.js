var getUserAgent = function(req) {
  var ua = null;

  if (req) {
    ua = req.headers['user-agent'];
  }

  return ua;
}

var getToken = function(req) {
  var token = null;
  var auth = req.headers['authorization'];

  if (req && auth) {
    token = auth.replace('Bearer', '').trim();
  }

  return token;
}

var getBasicAuth = function(req) {
  var credentials = null;
  var auth = req.headers['authorization'];

  if (req && auth && auth.indexOf('Basic') >= 0) {
    var b64Credentials = auth.replace('Basic', '').trim();
    var buf = new Buffer(b64Credentials, 'base64');
    var temp = buf.toString().split(':');

    credentials = {
      'username': temp[0],
      'password': temp[1]
    };
  }

  return credentials;
}

var getIPAddress = function(req) {
  var ipAddress = null;

  if (req) {
    ipAddress = req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress;
  }

  return ipAddress;
}

module.exports.getIP = getIPAddress;
module.exports.getUA = getUserAgent;
module.exports.getBearerToken = getToken;
module.exports.getBasicAuthentication = getBasicAuth;
