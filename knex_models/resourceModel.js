var config = require('../configs/config');
var knex = require('knex')(config.knex);
var bookshelf = require('bookshelf')(knex);

var Resource = bookshelf.Model.extend({
  tableName: 'resources',
  hasTimestamps: ['createdAt', 'updatedAt']
});

var Resources = bookshelf.Collection.extend({
  model: Resources
});

module.exports.Resource = Resource;
module.exports.Resources = Resources;
