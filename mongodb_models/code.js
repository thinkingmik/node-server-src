var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define our token schema
var CodeSchema   = new mongoose.Schema({
  value: {
    type: String,
    required: true,
    unique: true
  },
  redirectUri: {
    type: String,
    required: true
  },
  _user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  _client: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  }
});

// Export the Mongoose model
module.exports = mongoose.model('Code', CodeSchema);
