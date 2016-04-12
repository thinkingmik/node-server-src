var Promise = require('bluebird');
var bcrypt = Promise.promisifyAll(require('bcrypt-nodejs'));
var config = require('../configs/config');
var knex = require('knex')(config.knex);
var bookshelf = require('bookshelf')(knex);
var Token = require('./tokenModel').Token;
var Code = require('./codeModel').Code;
var Role = require('./roleModel').Role;
var UserRole = require('./userRoleModel').UserRole;
var Policy = require('./policyModel').Policy;

var User = bookshelf.Model.extend({
  tableName: 'users',
  hasTimestamps: ['createdAt', 'updatedAt'],
  tokens: function() {
    return this.hasMany(Token, 'userId');
  },
  codes: function() {
    return this.hasMany(Code, 'userId');
  },
  usersRoles: function() {
    return this.hasMany(UserRole, 'userId');
  },
  policies: function() {
    return this.hasMany(Policy, 'userId');
  },
  initialize: function () {
    this.on('creating', function (model) {
      return bcrypt.genSaltAsync(5)
        .then(function (salt) {
          return bcrypt.hashAsync(model.get('password'), salt, null);
        })
        .then(function (hash) {
          model.set('password', hash);
        });
    });
  },
  verifyPassword: function (password) {
    return bcrypt.compareAsync(password, this.get('password'));
  }
});

var Users = bookshelf.Collection.extend({
  model: User
});

module.exports.User = User;
module.exports.Users = Users;
