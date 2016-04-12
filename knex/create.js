var config = require('../configs/config');
var knex = require('knex')(config.knex);

knex.raw('')
.then(function() {
  console.log('[users] Creating table');
  return knex.schema.createTable('users', function(table) {
    table.increments('id').primary();
    table.string('username', 50).notNullable().unique();
    table.string('password', 255).notNullable().unique();
    table.string('email', 100).notNullable().unique();
    table.string('firstName', 100).nullable();
    table.string('lastName', 100).nullable();
    table.timestamp('createdAt').notNullable().defaultTo(knex.raw('now()'));
    table.timestamp('updatedAt').notNullable().defaultTo(knex.raw('now()'));
  });
})
.then(function() {
  console.log('[roles] Creating table');
  return knex.schema.createTable('roles', function(table) {
    table.increments('id').primary();
    table.string('name', 50).notNullable().unique();
    table.string('description', 255).nullable();
    table.timestamp('createdAt').notNullable().defaultTo(knex.raw('now()'));
    table.timestamp('updatedAt').notNullable().defaultTo(knex.raw('now()'));
  });
})
.then(function() {
  console.log('[usersRoles] Creating table');
  return knex.schema.createTable('usersRoles', function(table) {
    table.increments('id').primary();
    table.bigInteger('userId').unsigned().index().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE');
    table.bigInteger('roleId').unsigned().index().references('id').inTable('roles').onDelete('SET NULL').onUpdate('CASCADE');
    table.unique(['userId', 'roleId']);
    table.boolean('main').defaultTo(false);
    table.timestamp('expiration').nullable();
    table.timestamp('createdAt').notNullable().defaultTo(knex.raw('now()'));
    table.timestamp('updatedAt').notNullable().defaultTo(knex.raw('now()'));
  });
})
.then(function() {
  console.log('[clients] Creating table');
  return knex.schema.createTable('clients', function(table) {
    table.increments('id').primary();
    table.string('name', 50).notNullable().unique();
    table.string('secret', 255).notNullable().unique();
    table.string('description', 255).nullable();
    table.string('domain', 255).nullable();
    table.timestamp('createdAt').notNullable().defaultTo(knex.raw('now()'));
    table.timestamp('updatedAt').notNullable().defaultTo(knex.raw('now()'));
  });
})
.then(function() {
  console.log('[resources] Creating table');
  return knex.schema.createTable('resources', function(table) {
    table.string('id', 50).primary();
    table.string('description', 255).nullable();
    table.timestamp('createdAt').notNullable().defaultTo(knex.raw('now()'));
    table.timestamp('updatedAt').notNullable().defaultTo(knex.raw('now()'));
  });
})
.then(function() {
  console.log('[permissions] Creating table');
  return knex.schema.createTable('permissions', function(table) {
    table.string('id', 50).primary();
    table.string('description', 255).nullable();
    table.timestamp('createdAt').notNullable().defaultTo(knex.raw('now()'));
    table.timestamp('updatedAt').notNullable().defaultTo(knex.raw('now()'));
  });
})
.then(function() {
  console.log('[policies] Creating table');
  return knex.schema.createTable('policies', function(table) {
    table.increments('id').primary();
    table.bigInteger('userId').nullable().unsigned().index().references('id').inTable('users').onDelete('SET NULL').onUpdate('CASCADE');
    table.bigInteger('roleId').nullable().unsigned().index().references('id').inTable('roles').onDelete('SET NULL').onUpdate('CASCADE');
    table.string('resourceId').notNullable().index().references('id').inTable('resources').onDelete('CASCADE').onUpdate('CASCADE');
    table.string('permissionId').notNullable().index().references('id').inTable('permissions').onDelete('CASCADE').onUpdate('CASCADE');
    table.unique(['userId', 'roleId', 'resourceId', 'permissionId']);
    table.timestamp('expiration').nullable();
    table.timestamp('createdAt').notNullable().defaultTo(knex.raw('now()'));
    table.timestamp('updatedAt').notNullable().defaultTo(knex.raw('now()'));
  });
})
.then(function() {
  console.log('[tokens] Creating table');
  return knex.schema.createTable('tokens', function(table) {
    table.increments('id').primary();
    table.string('token', 1024).notNullable().unique();
    table.string('refresh', 1024).notNullable().unique();
    table.string('userAgent', 100).nullable();
    table.string('ipAddress', 15).nullable();
    table.bigInteger('userId').unsigned().index().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE');
    table.bigInteger('clientId').unsigned().index().references('id').inTable('clients').onDelete('CASCADE').onUpdate('CASCADE');
    table.timestamp('createdAt').notNullable().defaultTo(knex.raw('now()'));
  });
})
.then(function() {
  console.log('[codes] Creating table');
  return knex.schema.createTable('codes', function(table) {
    table.increments('id').primary();
    table.string('code', 512).notNullable().unique();
    table.string('redirectUri', 255).nullable();
    table.bigInteger('userId').unsigned().index().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE');
    table.bigInteger('clientId').unsigned().index().references('id').inTable('clients').onDelete('CASCADE').onUpdate('CASCADE');
    table.timestamp('createdAt').notNullable().defaultTo(knex.raw('now()'));
  });
})
.then(function() {
  console.log('[OK] Created all tables with success!');
})
.catch(function(err) {
  console.log('[ERROR] ' + err);
});
