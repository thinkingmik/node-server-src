var config = require('../configs/config');
var knex = require('knex')(config.knex);
var Bookshelf = require('bookshelf')(knex);
Bookshelf.plugin('registry');
require('./userModel');
require('./clientModel');

var Token = Bookshelf.Model.extend({
  tableName: 'tokens',
  hasTimestamps: ['createdAt'],
  user: function() {
    return this.belongsTo('User', 'id');
  },
  client: function() {
    return this.belongsTo('Client', 'id');
  },
  removeBy: function (clause, trx) {
    return Bookshelf.knex(this.tableName)
      .where(clause)
      .transacting(trx || {})
      .returning('id')
      .del()
      .then(function(res) {
        return res.length;
      });
  }
});

module.exports = Bookshelf.model('Token', Token);
