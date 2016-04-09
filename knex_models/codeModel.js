var config = require('../configs/config');
var knex = require('knex')(config.knex);
var bookshelf = require('bookshelf')(knex);

var Code = bookshelf.Model.extend({
  tableName: 'codes',
  hasTimestamps: ['createdAt']
});

var Codes = bookshelf.Collection.extend({
  model: Code
});

module.exports.Code = Code;
module.exports.Codes = Codes;
