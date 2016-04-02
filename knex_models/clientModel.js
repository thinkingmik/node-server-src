var config = require('../configs/config');
var knex = require('knex')(config.knex);
var table = 'clients';
var columns = 'id', 'name', 'secret', 'description', 'domain', 'createdAt', 'updatedAt';

/* ctor */
var Client = function (data) {
  data = data || {};
  this.metadata = {
    id: data.id,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
  }
  this.entity = {
    name: data.name,
    secret: data.secret,
    description: data.description,
    domain: data.domain
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
  plain['updatedAt'] = knex.raw('now()');

  if (plain['id'] != null) {
    var promise = knex(table)
      .transacting(trx)
      .where('id', '=', plain['id'])
      .update(plain, 'id')
      .then(function(res) {
        return res[0];
      });

    return promise;
  }
  else {
    delete plain['id'];
    plain['createdAt'] = knex.raw('now()');
    var promise = knex(table)
      .transacting(trx)
      .insert(plain, 'id')
      .then(function(res) {
        return res[0];
      });

    return promise;
  }
}

/* Static methods */
User.find = function (params) {
  var promise = knex.select(columns)
    .from(table)
    .where(params)
    .then(function(res) {
      var list = [];
      for (var key in res) {
        list.push(new Client(res[key]));
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
      return new Client(res);
    });

  return promise;
}

module.exports = Client;
