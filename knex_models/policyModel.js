var Promise = require('bluebird');
var moment = require('moment');
var config = require('../configs/config');
var knex = require('knex')(config.knex);
var Bookshelf = require('bookshelf')(knex);
Bookshelf.plugin('registry');
require('./userModel');
require('./roleModel');
require('./userRoleModel');
require('./resourceModel');
require('./permissionModel');

var Policy = Bookshelf.Model.extend({
  tableName: 'policies',
  hasTimestamps: ['createdAt', 'updatedAt'],
  user: function() {
    return this.belongsTo('User', 'id');
  },
  role: function() {
    return this.belongsTo('Role', 'id');
  },
  resource: function() {
    return this.belongsTo('Resource', 'id');
  },
  permission: function() {
    return this.belongsTo('Permission', 'id');
  },
  fetchAllByUserId: function(userId) {
    var rolesTable = 'roles';
    var usersRolesTable = 'usersRoles';
    var policiesTable = this.tableName;
    return new Promise(function(resolve, reject) {
      var nowdate = moment().format();
      Bookshelf.knex.select(policiesTable + '.*')
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

module.exports = Bookshelf.model('Policy', Policy);
