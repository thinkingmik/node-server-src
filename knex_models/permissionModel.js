var config = require('../configs/config');
var knex = require('knex')(config.knex);
var bookshelf = require('bookshelf')(knex);
var Policy = require('./policyModel').Policy;

var Permission = bookshelf.Model.extend({
  tableName: 'permissions',
  hasTimestamps: ['createdAt', 'updatedAt'],
  policies: function() {
    return this.hasMany(Policy, 'permissionId');
  }
});

var Permissions = bookshelf.Collection.extend({
  model: Permission
});

module.exports.Permission = Permission;
module.exports.Permissions = Permissions;
