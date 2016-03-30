var config = require('../configs/config');
var knex = require('knex')(config.knex);
var table = 'users';

var User = function (data) {
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

User.prototype.getId = function () {
  return this.metadata['id'];
}
User.prototype.get
User.prototype.get = function (name) {
    return this.entity[name];
}
User.prototype.set = function (name, value) {
    this.entity[name] = value;
}
User.prototype.save = function () {
    console.log(this);
    /*
    var self = this;
    db.get('users', {id: this.data.id}).update(JSON.stringify(this.data)).run(function (err, result) {
        if (err) return callback(err);
        callback(null, self);
    });
    */
}

User.find = function (params) {
  var promise = knex.select('id', 'username', 'password', 'createdAt', 'updatedAt')
    .from(table)
    .then(function(res) {
      var list = [];
      for (var key in res) {
        list.push(new User(res[key]));
      }
      return list;
    });

  return promise;
}

User.findOne = function (params) {
  var promise = knex.first('id', 'username', 'password', 'createdAt', 'updatedAt')
    .from(table)
    .where(params)
    .then(function(res) {
      return new User(res);
    });

  return promise;
}

module.exports = User;
