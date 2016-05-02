var cryptoManager = require('../utils/cryptoManager');
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
  },
  initialize: function () {
    this.on('creating', function (model) {
      return cryptoManager.cypher(model.get('secret'))
        .then(function(hash) {
          model.set('secret', hash);
        });
    });
  },
  verifySecret: function (secret) {
    return cryptoManager.compare(secret, this.get('secret'));
  }
});

module.exports = Bookshelf.model('Client', Client);
