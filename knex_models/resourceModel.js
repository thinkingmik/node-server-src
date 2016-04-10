var config = require('../configs/config');
var knex = require('knex')(config.knex);
var bookshelf = require('bookshelf')(knex);
var Policy = require('./policyModel').Policy;

var Resource = bookshelf.Model.extend({
  tableName: 'resources',
  hasTimestamps: ['createdAt', 'updatedAt'],
  policies: function() {
    return this.hasMany(Policy, 'resourceId');
  }
});

var Resources = bookshelf.Collection.extend({
  model: Resources
});

module.exports.Resource = Resource;
module.exports.Resources = Resources;
