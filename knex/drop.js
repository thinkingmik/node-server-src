var config = require('../configs/config');
var knex = require('knex')(config.knex);

knex.raw('')
.then(function() {
  console.log('[codes] Dropping table');
  return knex.schema.dropTableIfExists('codes');
})
.then(function() {
  console.log('[tokens] Dropping table');
  return knex.schema.dropTableIfExists('tokens');
})
.then(function() {
  console.log('[policies] Dropping table');
  return knex.schema.dropTableIfExists('policies');
})
.then(function() {
  console.log('[permissions] Dropping table');
  return knex.schema.dropTableIfExists('permissions');
})
.then(function() {
  console.log('[resources] Dropping table');
  return knex.schema.dropTableIfExists('resources');
})
.then(function() {
  console.log('[clients] Dropping table');
  return knex.schema.dropTableIfExists('clients');
})
.then(function() {
  console.log('[usersRoles] Dropping table');
  return knex.schema.dropTableIfExists('usersRoles');
})
.then(function() {
  console.log('[roles] Dropping table');
  return knex.schema.dropTableIfExists('roles');
})
.then(function() {
  console.log('[users] Dropping table');
  return knex.schema.dropTableIfExists('users');
})
.then(function() {
  console.log('[OK] Dropped all tables with success!');
})
.catch(function(err) {
  console.log('[ERROR] ' + err);
});
