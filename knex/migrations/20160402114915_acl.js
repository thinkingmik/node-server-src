var config = require('../../configs/config');
var knex = require('knex')(config.knex);

exports.up = function(knex, Promise) {
  console.log('Executing migration UP method for acl module');
  return Promise.all([
    knex.schema.createTable('roles', function(table) {
      table.increments('id').primary();
      table.string('name', 50).notNullable().unique();
      table.string('description', 255);
      table.timestamp('createdAt').notNullable().defaultTo(knex.raw('now()'));
      table.timestamp('updatedAt').notNullable().defaultTo(knex.raw('now()'));
    }),
    knex.schema.createTable('resources', function(table) {
      table.increments('id').primary();
      table.string('name', 50).notNullable().unique();
      table.string('description', 255);
      table.timestamp('createdAt').notNullable().defaultTo(knex.raw('now()'));
      table.timestamp('updatedAt').notNullable().defaultTo(knex.raw('now()'));
    }),
    knex.schema.createTable('permissions', function(table) {
      table.increments('id').primary();
      table.string('name', 50).notNullable().unique();
      table.string('description', 255);
      table.timestamp('createdAt').notNullable().defaultTo(knex.raw('now()'));
      table.timestamp('updatedAt').notNullable().defaultTo(knex.raw('now()'));
    }),
    knex.schema.createTable('rolePolicies', function(table) {
      table.increments('id').primary();
      table.bigInteger('roleId').unsigned().index().references('id').inTable('roles').onDelete('SET NULL').onUpdate('CASCADE');
      table.bigInteger('resourceId').unsigned().index().references('id').inTable('resources').onDelete('CASCADE').onUpdate('CASCADE');
      table.bigInteger('permissionId').unsigned().index().references('id').inTable('permissions').onDelete('CASCADE').onUpdate('CASCADE');
      table.string('name', 50).notNullable().unique();
      table.string('description', 255);
      table.timestamp('expiration');
      table.timestamp('createdAt').notNullable().defaultTo(knex.raw('now()'));
      table.timestamp('updatedAt').notNullable().defaultTo(knex.raw('now()'));
    }),
    knex.schema.createTable('userPolicies', function(table) {
      table.increments('id').primary();
      table.bigInteger('userId').unsigned().index().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE');
      table.bigInteger('resourceId').unsigned().index().references('id').inTable('resources').onDelete('CASCADE').onUpdate('CASCADE');
      table.bigInteger('permissionId').unsigned().index().references('id').inTable('permissions').onDelete('CASCADE').onUpdate('CASCADE');
      table.string('name', 50).notNullable().unique();
      table.string('description', 255);
      table.timestamp('expiration');
      table.timestamp('createdAt').notNullable().defaultTo(knex.raw('now()'));
      table.timestamp('updatedAt').notNullable().defaultTo(knex.raw('now()'));
    }),
    knex.schema.createTable('usersRoles', function(table) {
      table.increments('id').primary();
      table.bigInteger('userId').unsigned().index().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE');
      table.bigInteger('roleId').unsigned().index().references('id').inTable('roles').onDelete('SET NULL').onUpdate('CASCADE');
      table.unique(['userId', 'roleId']);
      table.boolean('main').defaultTo(false);
      table.timestamp('expiration');
      table.timestamp('createdAt').notNullable().defaultTo(knex.raw('now()'));
      table.timestamp('updatedAt').notNullable().defaultTo(knex.raw('now()'));
    })
  ]);
};
exports.down = function(knex, Promise) {
  console.log('Executing migration DOWN method for acl module');
  return knex.schema
    .dropTableIfExists('userRoles')
    .dropTableIfExists('userPolicies')
    .dropTableIfExists('rolePolicies')
    .dropTableIfExists('permissions')
    .dropTableIfExists('resources')
    .dropTableIfExists('roles');
};
exports.config = {
  transaction: false
};
