var config = require('../configs/config');
var knex = require('knex')(config.knex);
var bookshelf = require('bookshelf')(knex);

var RolePolicy = bookshelf.Model.extend({
  tableName: 'rolePolicies',
  hasTimestamps: ['createdAt', 'updatedAt']
});

var RolePolicies = bookshelf.Collection.extend({
  model: RolePolicy
});

module.exports.RolePolicy = RolePolicy;
module.exports.RolePolicies = RolePolicies;
