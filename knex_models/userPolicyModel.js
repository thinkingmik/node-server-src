var config = require('../configs/config');
var knex = require('knex')(config.knex);
var bookshelf = require('bookshelf')(knex);

var UserPolicy = bookshelf.Model.extend({
  tableName: 'userPolicies',
  hasTimestamps: ['createdAt', 'updatedAt']
});

var UserPolicies = bookshelf.Collection.extend({
  model: UserPolicy
});

module.exports.UserPolicy = UserPolicy;
module.exports.UserPolicies = UserPolicies;
