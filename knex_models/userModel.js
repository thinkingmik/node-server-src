var Promise = require('bluebird');
var bcrypt = Promise.promisifyAll(require('bcrypt-nodejs'));
var config = require('../configs/config');
var knex = require('knex')(config.knex);
var bookshelf = require('bookshelf')(knex);

var User = bookshelf.Model.extend({
  tableName: 'users',
  hasTimestamps: ['createdAt', 'updatedAt'],
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
