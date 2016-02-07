var getUserAgent = function(req) {
  var ua = null;

  if (req) {
    ua = req.headers['user-agent'];
  }

  return ua;
}

var getToken = function(req) {
  var token = null;
  
  if (req && req.headers['authorization']) {
    var bearer = req.headers['authorization'];
    token = bearer.replace('Bearer', '').trim();
  }

  return token;
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
