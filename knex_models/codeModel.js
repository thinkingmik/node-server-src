var config = require('../configs/config');
var knex = require('knex')(config.knex);
var table = 'codes';
var columns = 'id', 'redirectUri', 'userId', 'clientId', 'createdAt';

/* ctor */
var Code = function (data) {
  data = data || {};
  this.metadata = {
    id: data.id,
    createdAt: data.createdAt
  }
  this.entity = {
    redirectUri: data.redirectUri,
    userId: data.userId,
    clientId: data.clientId
  }
}

/* Public methods */
User.prototype.plain = function () {
  for (var key in this.metadata) {
    this.entity[key] = this.metadata[key];
  }
  return this.entity;
}
User.prototype.get = function (name) {
    if (this.entity[name] != null) {
      return this.entity[name];
    }
    else if (this.metadata[name] != null) {
      return this.metadata[name];
    }
    else {
      return null;
    }
}
User.prototype.set = function (name, value) {
    this.entity[name] = value;
}
User.prototype.save = function (trx) {
  var plain = this.plain();

  plain['createdAt'] = knex.raw('now()');
  var promise = knex(table)
    .transacting(trx)
    .insert(plain, 'id')
    .then(function(res) {
      return res[0];
    });

  return promise;
}

/* Static methods */
User.find = function (params) {
  var promise = knex.select(columns)
    .from(table)
    .where(params)
    .then(function(res) {
      var list = [];
      for (var key in res) {
        list.push(new Code(res[key]));
      }
      return list;
    });

  return promise;
}
User.findOne = function (params) {
  var promise = knex.first(columns)
    .from(table)
    .where(params)
    .then(function(res) {
      return new Code(res);
    });

  return promise;
}

module.exports = Code;
