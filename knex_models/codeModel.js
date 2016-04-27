var config = require('../configs/config');
var knex = require('knex')(config.knex);
var Bookshelf = require('bookshelf')(knex);
Bookshelf.plugin('registry');
require('./userModel');
require('./clientModel');

var Code = Bookshelf.Model.extend({
  tableName: 'codes',
  hasTimestamps: ['createdAt'],
  user: function() {
    return this.belongsTo('User', 'id');
  },
  client: function() {
    return this.belongsTo('Client', 'id');
  }
});

module.exports = Bookshelf.model('Code', Code);
