var Bookshelf = require('../database');
require('./policyModel');

var Resource = Bookshelf.Model.extend({
  tableName: 'resources',
  hasTimestamps: ['createdAt', 'updatedAt'],
  policies: function() {
    return this.hasMany('Policy', 'resourceId');
  }
});

module.exports = Bookshelf.model('Resource', Resource);
