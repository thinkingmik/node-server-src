var Bookshelf = require('../database');
require('./roleModel');
require('./userModel');

var UserRole = Bookshelf.Model.extend({
  tableName: 'usersRoles',
  hasTimestamps: ['createdAt', 'updatedAt'],
  user: function() {
    return this.belongsTo('User', 'id');
  },
  role: function() {
    return this.belongsTo('Role', 'id');
  }
});

module.exports = Bookshelf.model('UserRole', UserRole);
