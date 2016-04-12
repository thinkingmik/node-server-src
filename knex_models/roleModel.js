var config = require('../configs/config');
var knex = require('knex')(config.knex);
var bookshelf = require('bookshelf')(knex);
var UserRole = require('./userRoleModel').UserRole;
var Policy = require('./policyModel').Policy;

var Role = bookshelf.Model.extend({
  tableName: 'roles',
  hasTimestamps: ['createdAt', 'updatedAt'],
  usersRoles: function() {
    return this.hasMany(UserRole, 'roleId');
  },
  policies: function() {
    return this.hasMany(Policy, 'roleId');
  }
});

var Roles = bookshelf.Collection.extend({
  model: Role
});

module.exports.Role = Role;
module.exports.Roles = Roles;
