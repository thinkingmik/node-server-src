var config = require('../configs/config');
var knex = require('knex')(config.knex);
var bookshelf = require('bookshelf')(knex);
var Role = require('./roleModel').Role;
var User = require('./userModel').User;

var UserRole = bookshelf.Model.extend({
  tableName: 'usersRoles',
  hasTimestamps: ['createdAt', 'updatedAt'],
  user: function() {
    return this.belongsTo(User, 'id');
  },
  role: function() {
    return this.belongsTo(Role, 'id');
  }
});

var UserRoles = bookshelf.Collection.extend({
  model: UserRole
});

module.exports.UserRole = UserRole;
module.exports.UserRoles = UserRoles;
