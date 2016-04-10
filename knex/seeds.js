var config = require('../configs/config');
var knex = require('knex')(config.knex);
var User = require('../models/userModel').User;
var Client = require('../models/clientModel').Client;

var admin = User.forge({
  username: 'admin',
  password: 'admin123',
  email: 'admin@node.com',
  firstName: 'super',
  lastName: 'administrator'
})
.save()
.then(function(user) {
  console.log('[admin] Created new user');
})
.catch(function(err) {
  console.log('[ERROR] ' + err);
});

var guest = User.forge({
  username: 'guest',
  password: 'guest123',
  email: 'guest@node.com',
  firstName: 'user',
  lastName: 'guest'
})
.save()
.then(function(user) {
  console.log('[guest] Created new user');
})
.catch(function(err) {
  console.log('[ERROR] ' + err);
});

var client = Client.forge({
  name: 'client',
  secret: 'client123',
  description: 'the first client application',
  domain: 'localhost'
})
.save()
.then(function(user) {
  console.log('[client] Created new client application');
})
.catch(function(err) {
  console.log('[ERROR] ' + err);
});
