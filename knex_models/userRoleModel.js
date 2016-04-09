var config = require('../configs/config');
var knex = require('knex')(config.knex);
var bookshelf = require('bookshelf')(knex);

var UserRole = bookshelf.Model.extend({
  tableName: 'usersRoles',
  hasTimestamps: ['createdAt', 'updatedAt']
});

var UserRoles = bookshelf.Collection.extend({
  model: UserRole
});

module.exports.UserRole = UserRole;
module.exports.UserRoles = UserRoles;
