var config = require('../configs/config');
var knex = require('knex')(config.knex);
var bookshelf = require('bookshelf')(knex);

var Client = bookshelf.Model.extend({
  tableName: 'clients',
  hasTimestamps: ['createdAt', 'updatedAt']
});

var Clients = bookshelf.Collection.extend({
  model: Client
});

module.exports.Client = Client;
module.exports.Clients = Clients;
