var Promise = require('bluebird');
var config = require('../configs/config')[process.env.NODE_ENV];
var knex = require('knex')(config.knex);

knex.raw('')
.then(function() {
  console.log('[DROP] Dropping table codes');
  return knex.schema.dropTableIfExists('codes');
})
.then(function() {
  console.log('[DROP] Dropping table tokens');
  return knex.schema.dropTableIfExists('tokens');
})
.then(function() {
  console.log('[DROP] Dropping table policies');
  return knex.schema.dropTableIfExists('policies');
})
.then(function() {
  console.log('[DROP] Dropping table permissions');
  return knex.schema.dropTableIfExists('permissions');
})
.then(function() {
  console.log('[DROP] Dropping table resources');
  return knex.schema.dropTableIfExists('resources');
})
.then(function() {
  console.log('[DROP] Dropping table clients');
  return knex.schema.dropTableIfExists('clients');
})
.then(function() {
  console.log('[DROP] Dropping table usersRoles');
  return knex.schema.dropTableIfExists('usersRoles');
})
.then(function() {
  console.log('[DROP] Dropping table roles');
  return knex.schema.dropTableIfExists('roles');
})
.then(function() {
  console.log('[DROP] Dropping table users');
  return knex.schema.dropTableIfExists('users');
})
.then(function() {
  process.exit(0);
})
.catch(function(err) {
  console.log('[ERROR] ' + err);
});
