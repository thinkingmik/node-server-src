var config = require('../configs/config');
var knex = require('knex')(config.knex);
var bookshelf = require('bookshelf')(knex);
var Token = require('./tokenModel').Token;
var Code = require('./codeModel').Code;

var Client = bookshelf.Model.extend({
  tableName: 'clients',
  hasTimestamps: ['createdAt', 'updatedAt'],
  tokens: function() {
    return this.hasMany(Token, 'clientId');
  },
  codes: function() {
    return this.hasMany(Code, 'clientId');
  }
});

var Clients = bookshelf.Collection.extend({
  model: Client
});

module.exports.Client = Client;
module.exports.Clients = Clients;
