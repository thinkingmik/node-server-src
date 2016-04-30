var oauth2orize = require('oauth2orize');
var fs = require('fs');
var jwt = require('jsonwebtoken');
var crypto = require('crypto');
var Promise = require('bluebird');
var User = require('../../models/user');
var UserRole = require('../../models/acl/userRole');
var UserPolicy = require('../../models/acl/userPolicy');
var Client = require('../../models/client');
var Token = require('../../models/token');
var Code = require('../../models/code');
var headerHelper = require('../../utils/headerParser');
var config = require('../../configs/config')[process.env.NODE_ENV];
var NotFoundError = require('../../exceptions/notFoundError');
var handleError = require('../../utils/handleJsonResponse').Error;
var handleSuccess = require('../../utils/handleJsonResponse').Success;

// Create OAuth 2.0 server
var server = oauth2orize.createServer();

// Register serialialization function
server.serializeClient(function(client, callback) {
  return callback(null, client._id);
});

// Register deserialization function
server.deserializeClient(function(id, callback) {
  Client.findOneAsync({
    _id: id
  })
  .then(function(client) {
    // Success
    return client;
  })
  .nodeify(callback);
});

// Exchange credentials for authorization code (authorization code grant)
server.grant(oauth2orize.grant.code(function(client, redirectUri, user, ares, /*req,*/ callback) {
  // Create a new authorization code
  var newCode = new Code({
    value: uid(8),
    redirectUri: redirectUri,
    _client: client._id,
    _user: user._id
  });

  // Save the auth code and check for errors
  newCode.saveAsync()
  .then(function(code) {
    return code.value;
  })
  .nodeify(callback);
}));

// Exchange authorization code for access token (authorization code grant)
server.exchange(oauth2orize.exchange.code(function(client, code, redirectUri, /*req,*/ callback) {
  Code.findOneAsync({
    value: code
  })
  .bind({})
  .then(function(authCode) {
    this.authCode = authCode;
    // No token found
    if (!authCode) {
      throw new NotFoundError();
    }
    if (client._id.toString() != authCode._client) {
      throw new NotFoundError();
    }
    if (redirectUri !== authCode.redirectUri) {
      throw new NotFoundError();
    }
    return Code.removeAsync();
  })
  .then(function() {
    return createTokensAsync(client, this.authCode._user/*, req*/);
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
  User.findOneAsync({
    username: username
  })
  .bind({})
  .then(function(user) {
    this.user = user;
    // No user found with that username
    if (!user) {
      throw new NotFoundError();
    }
    // Make sure the password is correct
    return user.verifyPassword(password);
  })
  .then(function(isMatch) {
    if (!isMatch) {
      throw new NotFoundError();
    }
  })
  .then(function() {
    return createTokensAsync(client, this.user._id/*, req*/);
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
  Token.findOneAsync({
    refresh: refreshToken
  })
  .bind({})
  .then(function(token) {
    this.token = token;
    // No token found
    if (!token) {
      throw new NotFoundError();
    }
    return User.findByIdAsync(this.token._user);
  })
  .then(function(user) {
    this.user = user;
    var user = User.findByIdAsync(this.token._user);
    // No user found
    if (!user) {
      throw new NotFoundError();
    }
    return removeTokensAsync(this.token.value, client._id, this.user._id);
  })
  .then(function() {
    //TODO: wait for pull request on oauth2orize module
    return createTokensAsync(client, this.user._id/*, req*/);
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
  createTokensAsync(client, null/*, req*/)
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

  Token.findOneAsync({
    value: token
  })
  .then(function(token) {
    // No token found
    if (!token) {
      throw new NotFoundError();
    }

    return Token.removeAsync({
      _user: token._user,
      _client: token._client
    });
  })
  .then(function(ret) {
    handleSuccess(res, ret);
  })
  .catch(function(err) {
    handleError(res, err);
  });
}

// Remove access token and refresh token by client id and user id
var removeTokensAsync = function(accessToken, clientId, userId) {
  return new Promise(function(resolve, reject) {
    Token.removeAsync({
      value: accessToken
    })
    .then(function() {
      resolve(true);
    })
    .catch(function(err) {
      reject(err);
    });
  });
}

// Create access token (jwt if enabled) and refresh token by client and user id
var createTokensAsync = function(client, userId, req) {
  //TODO: wait for pull request on oauth2orize module
  var ipAddress = null;//headerHelper.getIP(req);
  var userAgent = null;//headerHelper.getUA(req);

  return new Promise(function(resolve, reject) {
    createJwtTokenAsync(client, userId, ipAddress, userAgent)
    .then(function(guid) {
      var token =  new Token({
        value: guid,
        refresh: uid(32),
        _client: client._id,
        _user: userId,
        address: ipAddress,
        ua: userAgent
      });

      return token.saveAsync();
    })
    .then(function(token, numberAffected) {
      var ret = [
        token.value,
        token.refresh,
        { 'expires_in': config.tokenLife }
      ];
      resolve(ret);
    })
    .catch(function(err) {
      reject(err);
    });
  });
}

// Create a JWT token
var createJwtTokenAsync = function(client, userId, ipAddress, userAgent) {
  return new Promise(function(resolve, reject) {
    if (config.jwt.enabled === false) {
      resolve(uid(32));
    }
    var createdAt = parseInt(Date.now(), 10);
    var token = null;

    var claim = {
      'iss': client.name,
      'sub': (userId != null) ? userId : client._id,
      'aud': client.domain,
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
    Client.findOneAsync({
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
