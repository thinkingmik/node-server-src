var config = require('../configs/config');
var knex = require('knex')(config.knex);
var table = 'codes';
var columns = ['id', 'redirectUri', 'userId', 'clientId', 'createdAt'];

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
Code.prototype.plain = function () {
  for (var key in this.metadata) {
    this.entity[key] = this.metadata[key];
  }
  return this.entity;
}
Code.prototype.get = function (name) {
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
Code.prototype.set = function (name, value) {
    this.entity[name] = value;
}
Code.prototype.save = function (trx) {
  var plain = this.plain();

  plain['createdAt'] = knex.raw('now()');
  var promise = knex(table)
    .transacting(trx)
    .returning('id')
    .insert(plain)
    .then(function(res) {
      return res[0];
    });

  return promise;
}
Code.prototype.remove = function (trx) {
  var promise = knex(table)
    .transacting(trx)
    .where('id', '=', this.get('id'))
    .returning('id')
    .del()
    .then(function(res) {
      return res[0];
    });

  return promise;
}

/* Static methods */
Code.find = function (params) {
  var promise = knex.select(columns)
    .from(table)
    .where(params || {})
    .then(function(res) {
      var list = [];
      for (var key in res) {
        list.push(new Code(res[key]));
      }
      return list;
    });

  return promise;
}
Code.findOne = function (params) {
  var promise = knex.first(columns)
    .from(table)
    .where(params || {})
    .then(function(res) {
      if (res != null) {
        return new Code(res);
      }
      return null;
    });

  return promise;
}

module.exports = Code;
