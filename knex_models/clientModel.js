var Bookshelf = require('../database');
require('./tokenModel');
require('./codeModel');

var Client = Bookshelf.Model.extend({
  tableName: 'clients',
  hasTimestamps: ['createdAt', 'updatedAt'],
  tokens: function() {
    return this.hasMany('Token', 'clientId');
  },
  codes: function() {
    return this.hasMany('Code', 'clientId');
  }
});

module.exports = Bookshelf.model('Client', Client);
