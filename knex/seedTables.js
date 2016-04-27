var Promise = require('bluebird');
var config = require('../configs/config');
var knex = require('knex')(config.knex);
var User = require('../models/userModel');
var Resource = require('../models/resourceModel');
var Permission = require('../models/permissionModel');
var Client = require('../models/clientModel');
var Role = require('../models/roleModel');
var UserRole = require('../models/userRoleModel');
var Policy = require('../models/policyModel');

var promise = new Promise(function(resolve, reject) {
  return resolve(true);
})
.then(function() {
  console.log('[SEED] Inserting new user admin');
  return User.forge({
    username: 'admin',
    password: 'admin123',
    email: 'admin@node.com',
    firstName: 'super',
    lastName: 'administrator'
  })
  .save();
})
.then(function() {
  console.log('[SEED] Inserting new user guest');
  return User.forge({
    username: 'guest',
    password: 'guest123',
    email: 'guest@node.com',
    firstName: 'user',
    lastName: 'guest'
  })
  .save();
})
.then(function() {
  console.log('[SEED] Inserting new client application dashboard');
  return Client.forge({
    name: 'dashboard',
    secret: 'dashboard123',
    description: 'the dashboard client application',
    domain: 'localhost'
  })
  .save();
})
.then(function() {
  console.log('[SEED] Inserting new role administrator');
  return Role.forge({
    name: 'administrator',
    description: 'the administrator role'
  })
  .save();
})
.then(function() {
  console.log('[SEED] Inserting new role member');
  return Role.forge({
    name: 'member',
    description: 'the member role'
  })
  .save();
})
.then(function() {
  console.log('[SEED] Inserting new user\'s role');
  return UserRole.forge({
    userId: 1,
    roleId: 1
  })
  .save();
})
.then(function() {
  console.log('[SEED] Inserting new user\'s role');
  return UserRole.forge({
    userId: 2,
    roleId: 2
  })
  .save();
})
.then(function() {
  console.log('[SEED] Inserting new permission GET');
  return Permission.forge({
    id: 'GET',
    description: 'read'
  })
  .save(null, {method: 'insert'});
})
.then(function() {
  console.log('[SEED] Inserting new permission POST');
  return Permission.forge({
    id: 'POST',
    description: 'create'
  })
  .save(null, {method: 'insert'});
})
.then(function() {
  console.log('[SEED] Inserting new permission PUT');
  return Permission.forge({
    id: 'PUT',
    description: 'update'
  })
  .save(null, {method: 'insert'});
})
.then(function() {
  console.log('[SEED] Inserting new permission DELETE');
  return Permission.forge({
    id: 'DELETE',
    description: 'delete'
  })
  .save(null, {method: 'insert'});
})
.then(function() {
  console.log('[SEED] Inserting new resource USERS');
  return Resource.forge({
    id: 'USERS',
    description: 'the users resource'
  })
  .save(null, {method: 'insert'});
})
.then(function() {
  console.log('[SEED] Inserting new resource CLIENTS');
  return Resource.forge({
    id: 'CLIENTS',
    description: 'the clients resource'
  })
  .save(null, {method: 'insert'});
})
.then(function() {
  console.log('[SEED] Inserting new resource ROLES');
  return Resource.forge({
    id: 'ROLES',
    description: 'the roles resource'
  })
  .save(null, {method: 'insert'});
})
.then(function() {
  console.log('[SEED] Inserting new policy');
  return Policy.forge({
    userId: 1,
    roleId: null,
    resourceId: 'USERS',
    permissionId: 'GET'
  })
  .save();
})
.then(function() {
  console.log('[SEED] Inserting new policy');
  return Policy.forge({
    userId: null,
    roleId: 1,
    resourceId: 'USERS',
    permissionId: 'POST'
  })
  .save();
})
.then(function() {
  console.log('[SEED] Inserting new policy');
  return Policy.forge({
    userId: 2,
    roleId: null,
    resourceId: 'CLIENTS',
    permissionId: 'GET'
  })
  .save();
})
.then(function() {
  console.log('[SEED] Inserting new policy');
  return Policy.forge({
    userId: null,
    roleId: 2,
    resourceId: 'CLIENTS',
    permissionId: 'POST'
  })
  .save();
})
.then(function() {
  process.exit(0);
})
.catch(function(err) {
  console.log('[ERROR] ' + err);
});
