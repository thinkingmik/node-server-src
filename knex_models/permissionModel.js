var Bookshelf = require('../database');
require('./policyModel');

var Permission = Bookshelf.Model.extend({
  tableName: 'permissions',
  hasTimestamps: ['createdAt', 'updatedAt'],
  policies: function() {
    return this.hasMany('Policy', 'permissionId');
  }
});

module.exports = Bookshelf.model('Permission', Permission);
