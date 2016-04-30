var config = require('./configs/config')[process.env.NODE_ENV];
var knex = require('knex')(config.knex);
var Bookshelf = require('bookshelf')(knex);

Bookshelf.plugin('registry');

module.exports = Bookshelf;
