var config = require('../configs/config');
var knex = require('knex')(config.knex);
var Bookshelf = require('bookshelf')(knex);
Bookshelf.plugin('registry');
require('./userRoleModel');
require('./policyModel');

var Role = Bookshelf.Model.extend({
  tableName: 'roles',
  hasTimestamps: ['createdAt', 'updatedAt'],
  usersRoles: function() {
    return this.hasMany('UserRole', 'roleId');
  },
  policies: function() {
    return this.hasMany('Policy', 'roleId');
  }
});

module.exports = Bookshelf.model('Role', Role);
