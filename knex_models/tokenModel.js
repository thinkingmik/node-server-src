var config = require('../configs/config');
var knex = require('knex')(config.knex);
var bookshelf = require('bookshelf')(knex);
var User = require('./userModel').User;
var Client = require('./clientModel').Client;

var Token = bookshelf.Model.extend({
  tableName: 'tokens',
  hasTimestamps: ['createdAt'],
  user: function() {
    return this.belongsTo(User, 'id');
  },
  client: function() {
    return this.belongsTo(Client, 'id');
  },
  removeBy: function (clause, trx) {
    return knex(this.tableName)
      .where(clause)
      .transacting(trx || {})
      .returning('id')
      .del();
  }
});

var Tokens = bookshelf.Collection.extend({
  model: Token
});

module.exports.Token = Token;
module.exports.Tokens = Tokens;
