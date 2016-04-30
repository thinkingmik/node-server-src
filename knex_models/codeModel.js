var Bookshelf = require('../database');
require('./userModel');
require('./clientModel');

var Code = Bookshelf.Model.extend({
  tableName: 'codes',
  hasTimestamps: ['createdAt'],
  user: function() {
    return this.belongsTo('User', 'id');
  },
  client: function() {
    return this.belongsTo('Client', 'id');
  }
});

module.exports = Bookshelf.model('Code', Code);
