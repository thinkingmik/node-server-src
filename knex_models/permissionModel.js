var config = require('../configs/config');
var knex = require('knex')(config.knex);
var bookshelf = require('bookshelf')(knex);

var Permission = bookshelf.Model.extend({
  tableName: 'permissions',
  hasTimestamps: ['createdAt', 'updatedAt']
});

var Permissions = bookshelf.Collection.extend({
  model: Permission
});

module.exports.Permission = Permission;
module.exports.Permissions = Permissions;
