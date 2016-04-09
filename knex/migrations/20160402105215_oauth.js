var config = require('../../configs/config');
var knex = require('knex')(config.knex);

exports.up = function(knex, Promise) {
  console.log('Executing migration UP method for oauth module');
  return Promise.all([
    knex.schema.createTable('users', function(table) {
      table.increments('id').primary();
      table.string('username', 50).notNullable().unique();
      table.string('password', 255).notNullable().unique();
      table.string('email', 100).notNullable().unique();
      table.string('firstName', 100);
      table.string('lastName', 100);
      table.timestamp('createdAt').notNullable().defaultTo(knex.raw('now()'));
      table.timestamp('updatedAt').notNullable().defaultTo(knex.raw('now()'));
    }),
    knex.schema.createTable('clients', function(table) {
      table.increments('id').primary();
      table.string('name', 50).notNullable().unique();
      table.string('secret', 255).notNullable().unique();
      table.string('description', 255);
      table.string('domain', 255);
      table.timestamp('createdAt').notNullable().defaultTo(knex.raw('now()'));
      table.timestamp('updatedAt').notNullable().defaultTo(knex.raw('now()'));
    }),
    knex.schema.createTable('tokens', function(table) {
      table.increments('id').primary();
      table.string('token', 1024).notNullable().unique();
      table.string('refresh', 1024).notNullable().unique();
      table.string('userAgent', 100);
      table.string('ipAddress', 15);
      table.bigInteger('userId').unsigned().index().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE');
      table.bigInteger('clientId').unsigned().index().references('id').inTable('clients').onDelete('CASCADE').onUpdate('CASCADE');
      table.timestamp('createdAt').notNullable().defaultTo(knex.raw('now()'));
    }),
    knex.schema.createTable('codes', function(table) {
      table.increments('id').primary();
      table.string('code', 512).notNullable().unique();
      table.string('redirectUri', 255);
      table.bigInteger('userId').unsigned().index().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE');
      table.bigInteger('clientId').unsigned().index().references('id').inTable('clients').onDelete('CASCADE').onUpdate('CASCADE');
      table.timestamp('createdAt').notNullable().defaultTo(knex.raw('now()'));
    })
  ]);
};
exports.down = function(knex, Promise) {
  console.log('Executing migration DOWN method for oauth module');
  return knex.schema
    .dropTableIfExists('codes')
    .dropTableIfExists('tokens')
    .dropTableIfExists('clients')
    .dropTableIfExists('users');
};
exports.config = {
  transaction: false
};
