var config = require('../configs/config');
var knex = require('knex')(config.knex);

var transaction = function (fn) {
  return function _transaction(knex, Promise) {
    return knex.transaction(function(trx) {
      return trx
      .raw('SET foreign_key_checks = 0;')
      .then(function() {
        return fn(trx, Promise);
      })
      .finally(function() {
        return trx.raw('SET foreign_key_checks = 1;');
      });
    });
  };
}

var up = function (trx, Promise) {
  return trx.schema
  .createTable('users', function(table) {
    table.increments('id').primary();
    table.string('username').notNullable();
    table.string('password').notNullable().unique();
    table.datetime('createdAt');
    table.datetime('updatedAt');
  })
}

var down = function (trx, Promise) {
  return trx.schema
  .dropTable('user');
}

exports.up = transaction(up);
exports.down = transaction(down);
