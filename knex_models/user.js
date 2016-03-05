var config = require('../configs/config');
var knex = require('knex')(config.knex);

var User = function (data) {
  this.data = this.sanitize(data);
}

User.prototype.data = {}

User.prototype.get = function (name) {
  return this.data[name];
}

User.prototype.set = function (name, value) {
  this.data[name] = value;
}

User.prototype.sanitize = function (data) {
  data = data || {};
  return mapper = {
    id: data.id,
    username: data.username,
    password: data.password,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
  };
}

User.find = function (params, callback) {
  var self = this;
  var promise = knex.select('id', 'username', 'password', 'createdAt', 'updatedAt')
    .from('users')
    .where(params);

  if (callback) {
      promise.then(function (res) {
        callback(null, res.map(function (item) { return new User(item); }));
      })
      .catch(function(err) {
        callback(err);
      });
  }
  else {
    return promise;
  }
}

User.findOne = function (params, callback) {
  var self = this;
  var promise = knex.first('id', 'username', 'password', 'createdAt', 'updatedAt')
    .from('users')
    .where(params);

  if (callback) {
      promise.then(function(res) {
        callback(null, new User(res));
      })
      .catch(function(err) {
        callback(err);
      });
  }
  else {
    return promise;
  }
}

module.exports = User;
