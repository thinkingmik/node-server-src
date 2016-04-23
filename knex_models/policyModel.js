var Promise = require('bluebird');
var moment = require('moment');
var config = require('../configs/config');
var knex = require('knex')(config.knex);
var bookshelf = require('bookshelf')(knex);
var User = require('./userModel').User;
var Role = require('./roleModel').Role;
var UserRole = require('./userRoleModel').UserRole;
var Resource = require('./resourceModel').Resource;
var Permission = require('./permissionModel').Permission;

var Policy = bookshelf.Model.extend({
  tableName: 'policies',
  hasTimestamps: ['createdAt', 'updatedAt'],
  user: function() {
    return this.belongsTo(User, 'id');
  },
  role: function() {
    return this.belongsTo(Role, 'id');
  },
  resource: function() {
    return this.belongsTo(Resource, 'id');
  },
  permission: function() {
    return this.belongsTo(Permission, 'id');
  },
  fetchAllByUserId: function(userId) {
    var rolesTable = Role.forge().tableName;
    var usersRolesTable = UserRole.forge().tableName;
    var policiesTable = this.tableName;
    return new Promise(function(resolve, reject) {
      var nowdate = moment().format();
      knex.select(policiesTable + '.*')
      .from(policiesTable)
      .leftJoin(usersRolesTable, usersRolesTable + '.roleId', policiesTable + '.roleId')
      .leftJoin(rolesTable, rolesTable + '.id', usersRolesTable + '.roleId')
      .where(function() {
      	this.where(policiesTable + '.userId', '=', userId).orWhere(function() {
          this.where(usersRolesTable + '.userId', '=', userId).andWhere(rolesTable + '.enabled', '=', true);
        })
      })
      .andWhere(function() {
        this.whereNull(usersRolesTable + '.activation').orWhere(usersRolesTable + '.activation', '<=', nowdate);
      })
      .andWhere(function() {
      	this.whereNull(usersRolesTable + '.expiration').orWhere(usersRolesTable + '.expiration', '>', nowdate);
      })
      .andWhere(function() {
      	this.whereNull(policiesTable + '.activation').orWhere(policiesTable + '.activation', '<=', nowdate);
      })
      .andWhere(function() {
      	this.whereNull(policiesTable + '.expiration').orWhere(policiesTable + '.expiration', '>', nowdate);
      })
      .then(function(res) {
        var policies = [];
        for (var key in res) {
          var raw = res[key];
          var policy = Policy.forge(raw);
          policies.push(policy);
        }
        resolve(policies);
      })
      .catch(function(err) {
        reject(err);
      })
    });
  }
});

var Policies = bookshelf.Collection.extend({
  model: Policy
});

module.exports.Policy = Policy;
module.exports.Policies = Policies;
