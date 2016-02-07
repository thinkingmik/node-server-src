var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define our token schema
var TokenSchema   = new mongoose.Schema({
  value: {
    type: String,
    required: true,
    unique: true
  },
  refresh: {
    type: String,
    required: false,
    unique: true
  },
  _user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  _client: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  address: {
    type: String,
    required: false
  },
  ua: {
    type: String,
    required: false
  },
  created: {
    type: Date,
    default: Date.now
  }
});

// Add unique keys
TokenSchema.index({ value: 1, refresh: 1 }, { unique: true });

// Export the Mongoose model
module.exports = mongoose.model('Token', TokenSchema);
