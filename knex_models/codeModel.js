var config = require('../configs/config');
var knex = require('knex')(config.knex);
var bookshelf = require('bookshelf')(knex);
var User = require('./userModel').User;
var Client = require('./clientModel').Client;

var Code = bookshelf.Model.extend({
  tableName: 'codes',
  hasTimestamps: ['createdAt'],
  user: function() {
    return this.belongsTo(User, 'id');
  },
  client: function() {
    return this.belongsTo(Client, 'id');
  }
});

var Codes = bookshelf.Collection.extend({
  model: Code
});

module.exports.Code = Code;
module.exports.Codes = Codes;
