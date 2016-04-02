var config = require('../configs/config');
var knex = require('knex')(config.knex);
var table = 'roles';
var columns = ['id', 'name', 'description', 'createdAt', 'updatedAt'];

/* ctor */
var Role = function (data) {
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
Role.prototype.plain = function () {
  for (var key in this.metadata) {
    this.entity[key] = this.metadata[key];
  }
  return this.entity;
}
Role.prototype.get = function (name) {
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
Role.prototype.set = function (name, value) {
    this.entity[name] = value;
}
Role.prototype.save = function (trx) {
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
Role.find = function (params) {
  var promise = knex.select(columns)
    .from(table)
    .where(params)
    .then(function(res) {
      var list = [];
      for (var key in res) {
        list.push(new Role(res[key]));
      }
      return list;
    });

  return promise;
}
Role.findOne = function (params) {
  var promise = knex.first(columns)
    .from(table)
    .where(params)
    .then(function(res) {
      if (res != null) {
        return new Role(res);
      }
      return null;
    });

  return promise;
}

module.exports = Role;
