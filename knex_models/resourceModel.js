var config = require('../configs/config');
var knex = require('knex')(config.knex);
var table = 'resources';
var columns = ['id', 'name', 'description', 'createdAt', 'updatedAt'];

/* ctor */
var Resource = function (data) {
  data = data || {};
  this.metadata = {
    id: data.id,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
  }
  this.entity = {
    name: data.name,
    description: data.description
  }
}

/* Public methods */
Resource.prototype.plain = function () {
  for (var key in this.metadata) {
    this.entity[key] = this.metadata[key];
  }
  return this.entity;
}
Resource.prototype.get = function (name) {
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
Resource.prototype.set = function (name, value) {
    this.entity[name] = value;
}
Resource.prototype.save = function (trx) {
  var plain = this.plain();
  plain['updatedAt'] = knex.raw('now()');

  if (plain['id'] != null) {
    var promise = knex(table)
      .transacting(trx)
      .where('id', '=', plain['id'])
      .returning('id')
      .update(plain)
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
      .returning('id')
      .insert(plain)
      .then(function(res) {
        return res[0];
      });

    return promise;
  }
}

/* Static methods */
Resource.find = function (params) {
  var promise = knex.select(columns)
    .from(table)
    .where(params || {})
    .then(function(res) {
      var list = [];
      for (var key in res) {
        list.push(new Resource(res[key]));
      }
      return list;
    });

  return promise;
}
Resource.findOne = function (params) {
  var promise = knex.first(columns)
    .from(table)
    .where(params || {})
    .then(function(res) {
      if (res != null) {
        return new Resource(res);
      }
      return null;
    });

  return promise;
}

module.exports = Resource;
