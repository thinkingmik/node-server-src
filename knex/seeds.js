var Promise = require('bluebird');
var config = require('../configs/config');
var knex = require('knex')(config.knex);
var User = require('../models/userModel').User;
var Resource = require('../models/resourceModel').Resource;
var Permission = require('../models/permissionModel').Permission;
var Client = require('../models/clientModel').Client;
var Role = require('../models/roleModel').Role;
var UserRole = require('../models/userRoleModel').UserRole;
var Policy = require('../models/policyModel').Policy;

var u1 = User.forge({
  username: 'admin',
  password: 'admin123',
  email: 'admin@node.com',
  firstName: 'super',
  lastName: 'administrator'
})
.save()
.then(function(u) {
  console.log('[admin] Created new user');
})
.catch(function(err) {
  console.log('[ERROR] ' + err);
});
var u2 = User.forge({
  username: 'guest',
  password: 'guest123',
  email: 'guest@node.com',
  firstName: 'user',
  lastName: 'guest'
})
.save()
.then(function(c) {
  console.log('[guest] Created new user');
})
.catch(function(err) {
  console.log('[ERROR] ' + err);
});
/******************************************************************************/
var c1 = Client.forge({
  name: 'client',
  secret: 'client123',
  description: 'the first client application',
  domain: 'localhost'
})
.save()
.then(function(c) {
  console.log('[client] Created new client application');
})
.catch(function(err) {
  console.log('[ERROR] ' + err);
});
/******************************************************************************/
var r1 = Role.forge({
  name: 'administrator',
  description: 'the administrator role'
})
.save()
.then(function(r) {
  console.log('[administrator] Created new role');
})
.catch(function(err) {
  console.log('[ERROR] ' + err);
});
var r2 = Role.forge({
  name: 'member',
  description: 'the member role'
})
.save()
.then(function(r) {
  console.log('[member] Created new role');
})
.catch(function(err) {
  console.log('[ERROR] ' + err);
});
/******************************************************************************/
Promise.all([u1, u2, r1, r2]).then(function() {
  var ur1 = UserRole.forge({
    userId: 1,
    roleId: 1
  })
  .save()
  .then(function(ur) {
    console.log('[administrator] Added a user\'s role');
  })
  .catch(function(err) {
    console.log('[ERROR] ' + err);
  });
  var ur2 = UserRole.forge({
    userId: 2,
    roleId: 2
  })
  .save()
  .then(function(ur) {
    console.log('[member] Added a user\'s role');
  })
  .catch(function(err) {
    console.log('[ERROR] ' + err);
  });
});
/******************************************************************************/
var p1 = Permission.forge({
  id: 'GET',
  description: 'read'
})
.save(null, {method: 'insert'})
.then(function(p) {
  console.log('[get] Created new permission');
})
.catch(function(err) {
  console.log('[ERROR] ' + err);
});
var p2 = Permission.forge({
  id: 'POST',
  description: 'create'
})
.save(null, {method: 'insert'})
.then(function(p) {
  console.log('[post] Created new permission');
})
.catch(function(err) {
  console.log('[ERROR] ' + err);
});
var p3 = Permission.forge({
  id: 'PUT',
  description: 'update'
})
.save(null, {method: 'insert'})
.then(function(p) {
  console.log('[put] Created new permission');
})
.catch(function(err) {
  console.log('[ERROR] ' + err);
});
var p4 = Permission.forge({
  id: 'DELETE',
  description: 'delete'
})
.save(null, {method: 'insert'})
.then(function(p) {
  console.log('[delete] Created new permission');
})
.catch(function(err) {
  console.log('[ERROR] ' + err);
});
/******************************************************************************/
var rs1 = Resource.forge({
  id: 'USERS',
  description: 'the users resource'
})
.save(null, {method: 'insert'})
.then(function(p) {
  console.log('[users] Created new resource');
})
.catch(function(err) {
  console.log('[ERROR] ' + err);
});
var rs2 = Resource.forge({
  id: 'CLIENTS',
  description: 'the clients resource'
})
.save(null, {method: 'insert'})
.then(function(p) {
  console.log('[clients] Created new resource');
})
.catch(function(err) {
  console.log('[ERROR] ' + err);
});
var rs3 = Resource.forge({
  id: 'ROLES',
  description: 'the roles resource'
})
.save(null, {method: 'insert'})
.then(function(p) {
  console.log('[roles] Created new resource');
})
.catch(function(err) {
  console.log('[ERROR] ' + err);
});
/******************************************************************************/
Promise.all([u1, u2, r1, r2, rs1, rs2, rs3, p1, p2, p3, p4]).then(function() {
  var po1 = Policy.forge({
    userId: 1,
    roleId: null,
    resourceId: 'USERS',
    permissionId: 'GET'
  })
  .save()
  .then(function(p) {
    console.log('[policy] Created new policy');
  })
  .catch(function(err) {
    console.log('[ERROR] ' + err);
  });
  var po2 = Policy.forge({
    userId: null,
    roleId: 1,
    resourceId: 'USERS',
    permissionId: 'POST'
  })
  .save()
  .then(function(p) {
    console.log('[policy] Created new policy');
  })
  .catch(function(err) {
    console.log('[ERROR] ' + err);
  });
});
/******************************************************************************/
