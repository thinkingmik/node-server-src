var config = require('../configs/config');
var knex = require('knex')(config.knex);
var Bookshelf = require('bookshelf')(knex);
Bookshelf.plugin('registry');
require('./policyModel');

var Resource = Bookshelf.Model.extend({
  tableName: 'resources',
  hasTimestamps: ['createdAt', 'updatedAt'],
  policies: function() {
    return this.hasMany('Policy', 'resourceId');
  }
});

module.exports = Bookshelf.model('Resource', Resource);
