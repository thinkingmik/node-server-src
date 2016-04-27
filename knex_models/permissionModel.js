var config = require('../configs/config');
var knex = require('knex')(config.knex);
var Bookshelf = require('bookshelf')(knex);
Bookshelf.plugin('registry');
require('./policyModel');

var Permission = Bookshelf.Model.extend({
  tableName: 'permissions',
  hasTimestamps: ['createdAt', 'updatedAt'],
  policies: function() {
    return this.hasMany('Policy', 'permissionId');
  }
});

module.exports = Bookshelf.model('Permission', Permission);
