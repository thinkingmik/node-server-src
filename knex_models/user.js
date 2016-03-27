var config = require('../configs/config');
var knex = require('knex')(config.knex);
var table = 'users';

var User = function (data) {
  this.sanitize(data);
}

User.prototype.entity = {}
User.prototype.metadata = {}
User.prototype.sanitize = function (data) {
  data = data || {};
  this.metadata = {
    id: data.id,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
  }
  this.entity = {
    username: data.username,
    password: data.password,
    email: data.email,
    firstName: data.first_name,
    lastName: data.last_name
  }
}

User.getTable = function() {
  return table;
}

User.find = function (params) {
  var promise = knex.select('id', 'username', 'password', 'createdAt', 'updatedAt')
    .from(this.getTable())
    .where(params);

  return promise;
}

User.findOne = function (params) {
  var promise = knex.first('id', 'username', 'password', 'createdAt', 'updatedAt')
    .from(this.getTable())
    .where(params);

  return promise;
}

module.exports = User;
