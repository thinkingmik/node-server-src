var config = require('../configs/config');
var knex = require('knex')(config.knex);
var bookshelf = require('bookshelf')(knex);

var Token = bookshelf.Model.extend({
  tableName: 'tokens',
  hasTimestamps: ['createdAt']
});

var Tokens = bookshelf.Collection.extend({
  model: Token
});

module.exports.Token = Token;
module.exports.Tokens = Tokens;
