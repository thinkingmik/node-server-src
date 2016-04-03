var oauth2orize = require('oauth2orize');
var fs = require('fs');
var jwt = require('jsonwebtoken');
var crypto = require('crypto');
var Promise = require('bluebird');
var User = require('../knex_models/userModel');
var Client = require('../knex_models/clientModel');
var Token = require('../knex_models/tokenModel');
var Code = require('../knex_models/codeModel');
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
  Client.findOne({
    id: id
  })
  .then(function(client) {
    return client;
  })
  .nodeify(callback);
});

// Exchange credentials for authorization code (authorization code grant)
server.grant(oauth2orize.grant.code(function(client, redirectUri, user, ares, /*req,*/ callback) {
  var newCode = new Code({
    id: uid(8),
    redirectUri: redirectUri,
    clientId: client.get('id'),
    userId: user.get('id')
  });

  newCode.save()
  .then(function(code) {
    return code;
  })
  .nodeify(callback);
}));

// Exchange authorization code for access token (authorization code grant)
server.exchange(oauth2orize.exchange.code(function(client, code, redirectUri, /*req,*/ callback) {
  Code.findOne({
    id: code
  })
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
    return this.authCode.remove();
  })
  .then(function(ret) {
    return createTokens(client, this.authCode.get('userId')/*, req*/);
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
server.exchange(oauth2orize.exchange.password(function(client, username, password, scope, /*req,*/ callback) {
  User.findOne({
    username: username
  })
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
    return createTokens(client, this.user.get('id')/*, req*/);
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
server.exchange(oauth2orize.exchange.refreshToken(function (client, refreshToken, scope, /*req,*/ callback) {
  Token.findOne({
    refresh: refreshToken
  })
  .bind({})
  .then(function(token) {
    this.token = token;
    if (!token) {
      throw new NotFoundError();
    }
    return User.findOne({
      id: this.token.get('userId')
    });
  })
  .then(function(user) {
    this.user = user;
    return this.token.remove();
  })
  .then(function() {
    //TODO: wait for pull request on oauth2orize module
    return createTokens(client, this.user.get('id')/*, req*/);
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
server.exchange(oauth2orize.exchange.clientCredentials(function(client, scope, /*req,*/ callback) {
  createTokens(client, null/*, req*/)
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
  Token.findOne({
    id: token
  })
  .then(function(token) {
    if (!token) {
      throw new NotFoundError();
    }
    return Token.remove({
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

// Create access token (jwt if enabled) and refresh token by client and user id
var createTokens = function(client, userId, req) {
  //TODO: wait for pull request on oauth2orize module
  var ipAddress = null;//headerHelper.getIP(req);
  var userAgent = null;//headerHelper.getUA(req);

  return new Promise(function(resolve, reject) {
    createJwtToken(client, userId, ipAddress, userAgent)
    .bind({})
    .then(function(guid) {
      this.token =  new Token({
        id: guid,
        refresh: uid(32),
        clientId: client.get('id'),
        userId: userId,
        ipAddress: ipAddress,
        userAgent: userAgent
      });

      return this.token.save();
    })
    .then(function(ret) {
      var obj = [
        this.token.get('id'),
        this.token.get('refresh'),
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
      'iat': createdAt,
      'roles': [],
      'policies': []
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
    Client.findOne({
      name: clientId
    })
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
