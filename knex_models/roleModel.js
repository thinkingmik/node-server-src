var config = require('../configs/config');
var knex = require('knex')(config.knex);
var bookshelf = require('bookshelf')(knex);

var Role = bookshelf.Model.extend({
  tableName: 'roles',
  hasTimestamps: ['createdAt', 'updatedAt']
});

var Roles = bookshelf.Collection.extend({
  model: Role
});

module.exports.Role = Role;
module.exports.Roles = Roles;
