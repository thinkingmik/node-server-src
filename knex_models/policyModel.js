var config = require('../configs/config');
var knex = require('knex')(config.knex);
var bookshelf = require('bookshelf')(knex);
var User = require('./userModel').User;
var Role = require('./roleModel').Role;
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
  }
});

var Policies = bookshelf.Collection.extend({
  model: Policy
});

module.exports.Policy = Policy;
module.exports.Policies = Policies;
