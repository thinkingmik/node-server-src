var oauth2orize = require('oauth2orize');
var fs = require('fs');
var jwt = require('jsonwebtoken');
var crypto = require('crypto');
var Promise = require('bluebird');
var User = require('../models/userModel');
var Client = require('../models/clientModel');
var Token = require('../models/tokenModel');
var Code = require('../models/codeModel');
var headerHelper = require('../utils/headerParser');
var config = require('../configs/config');
var NotFoundError = require('../exceptions/notFoundError');
var handleError = require('../utils/handleJsonResponse').Error;
var handleSuccess = require('../utils/handleJsonResponse').Success;

// Create OAuth 2.0 server
var server = oauth2orize.createServer();

// Register serialialization function
server.serializeClient(function(client, callback) {
  return callback(null, client.get('id'));
});

// Register deserialization function
server.deserializeClient(function(id, callback) {
  Client.forge()
  .where({
    id: id,
    enabled: true
  })
  .fetch()
  .then(function(client) {
    return client;
  })
  .nodeify(callback);
});

// Exchange credentials for authorization code (authorization code grant)
server.grant(oauth2orize.grant.code(function(client, redirectUri, user, ares, req, callback) {
  Code.forge({
    code: uid(8),
    redirectUri: redirectUri,
    clientId: client.get('id'),
    userId: user.get('id')
  })
  .save()
  .then(function(code) {
    return code.get('code');
  })
  .nodeify(callback);
}));

// Exchange authorization code for access token (authorization code grant)
server.exchange(oauth2orize.exchange.code(function(client, code, redirectUri, req, callback) {
  Code.forge()
  .where({
    code: code
  })
  .fetch()
  .bind({})
  .then(function(authCode) {
    this.authCode = authCode;
    if (!authCode) {
      throw new NotFoundError();
    }
    if (client.get('id').toString() != this.authCode.get('clientId')) {
      throw new NotFoundError();
    }
    if (redirectUri !== this.authCode.get('redirectUri')) {
      throw new NotFoundError();
    }
    return this.authCode.destroy();
  })
  .then(function(ret) {
    return createTokens(client, this.authCode.get('userId'), req);
  })
  .nodeify(function(err, token, refresh, expires) {
    if (!err) {
      callback(null, token, refresh, expires);
    }
    else if (err instanceof NotFoundError) {
      callback(null, false);
    }
    else {
      callback(err);
    }
  }, { spread: true });
}));

// Exchange credentials for access token (resource owner password credentials grant)
server.exchange(oauth2orize.exchange.password(function(client, username, password, scope, req, callback) {
  User.forge()
  .where({
    username: username,
    enabled: true
  })
  .fetch()
  .bind({})
  .then(function(user) {
    this.user = user;
    if (!user) {
      throw new NotFoundError();
    }
    return user.verifyPassword(password);
  })
  .then(function(isMatch) {
    if (!isMatch) {
      throw new NotFoundError();
    }
  })
  .then(function() {
    return createTokens(client, this.user.get('id'), req);
  })
  .nodeify(function(err, token, refresh, expires) {
    if (!err) {
      callback(null, token, refresh, expires);
    }
    else if (err instanceof NotFoundError) {
      callback(null, false);
    }
    else {
      callback(err);
    }
  }, { spread: true });
}));

// Exchange refresh token with new access token (refresh token grant)
server.exchange(oauth2orize.exchange.refreshToken(function (client, refreshToken, scope, req, callback) {
  Token.forge()
  .where({
    refresh: refreshToken
  })
  .fetch()
  .bind({})
  .then(function(token) {
    this.token = token;
    if (!token) {
      throw new NotFoundError();
    }
    return User.forge()
      .where({
        id: this.token.get('userId'),
        enabled: true
      })
      .fetch();
  })
  .then(function(user) {
    this.user = user;
    if (!this.user) {
      throw new NotFoundError();
    }
    return this.token.destroy();
  })
  .then(function() {
    return createTokens(client, this.user.get('id'), req);
  })
  .nodeify(function(err, token, refresh, expires) {
    if (!err) {
      callback(null, token, refresh, expires);
    }
    else if (err instanceof NotFoundError) {
      callback(null, false);
    }
    else {
      callback(err);
    }
  }, { spread: true });
}));

// Exchange credentials for access token (client credentials grant)
server.exchange(oauth2orize.exchange.clientCredentials(function(client, scope, req, callback) {
  createTokens(client, null, req)
  .spread(function(token, refresh, expiration) {
    callback(null, token, refresh, expiration);
  })
  .catch(function(err) {
    if (err instanceof NotFoundError) {
      callback(null, false);
    }
    else {
      callback(err);
    }
  });
}));

//Delete all tokens associated to the user
var doLogout = function(req, res) {
  var token = headerHelper.getBearerToken(req);
  Token.forge()
  .where({
    token: token
  })
  .fetch()
  .then(function(token) {
    if (!token) {
      throw new NotFoundError();
    }
    return token.removeBy({
        userId: token.get('userId'),
        clientId: token.get('clientId')
      });
  })
  .then(function(ret) {
    handleSuccess(res, ret);
  })
  .catch(function(err) {
    handleError(res, err);
  });
}

var test = function(req, res) {
  handleSuccess(res, true);
}

// Create access token (jwt if enabled) and refresh token by client and user id
var createTokens = function(client, userId, req) {
  //TODO: wait for pull request on oauth2orize module
  var ipAddress = req.ipAddress;//headerHelper.getIP(req);
  var userAgent = req.userAgent;//headerHelper.getUA(req);

  return new Promise(function(resolve, reject) {
    createJwtToken(client, userId, ipAddress, userAgent)
    .bind({})
    .then(function(guid) {
      return Token.forge({
        token: guid,
        refresh: uid(32),
        clientId: client.get('id'),
        userId: userId,
        ipAddress: ipAddress,
        userAgent: userAgent
      })
      .save();
    })
    .then(function(token) {
      var obj = [
        token.get('token'),
        token.get('refresh'),
        { 'expires_in': config.tokenLife }
      ];
      resolve(obj);
    })
    .catch(function(err) {
      reject(err);
    });
  });
}

// Create a JWT token
var createJwtToken = function(client, userId, ipAddress, userAgent) {
  return new Promise(function(resolve, reject) {
    if (config.jwt.enabled === false) {
      resolve(uid(32));
    }
    var createdAt = parseInt(Date.now(), 10);
    var token = null;

    var claim = {
      'iss': client.name,
      'sub': (userId != null) ? userId : client.get('id'),
      'aud': client.get('domain'),
      'ipa': ipAddress,
      'bua': userAgent,
      'jti': uid(16),
      'iat': createdAt
    };

    if (config.jwt.cert != null) {
      var cert = fs.readFileSync(config.jwt.cert);
      token = jwt.sign(
        claim,
        cert,
        { algorithm: config.jwt.algorithm, expiresIn: config.tokenLife }
      );
    }
    else {
      token = jwt.sign(
        claim,
        config.jwt.secretKey,
        { expiresIn: config.tokenLife }
      );
    }

    resolve(token);
  });
}

// Create a random token
var uid = function(len) {
  return crypto.randomBytes(len).toString('hex');
}

//User authorization endpoint
exports.authorization = [
  server.authorization(function(clientId, redirectUri, callback) {
    Client.forge()
    .where({
      name: clientId,
      enabled: true
    })
    .fetch()
    .then(function(client) {
      return [client, redirectUri];
    })
    .nodeify(callback, { spread: true });
  }),
  function(req, res) {
    res.render('dialog', {
      transactionID: req.oauth2.transactionID,
      user: req.user,
      client: req.oauth2.client
    });
  }
];

//User decision endpoint
exports.decision = [
  server.decision()
];

//Token endpoint
exports.token = [
  server.token(),
  server.errorHandler()
];

//Logout endpoint
exports.logout = doLogout;

//Test endpoint
exports.test = test;
