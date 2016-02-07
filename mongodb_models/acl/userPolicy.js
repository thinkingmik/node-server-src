var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define our role policy schema
var UserPolicySchema = new mongoose.Schema({
  _user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  _resource: {
    type: Schema.Types.ObjectId,
    ref: 'Resource'
  },
  _permission: {
    type: Schema.Types.ObjectId,
    ref: 'Permission'
  },
  expiration: {
    type: Date,
    default: null,
    required: false
  },
  description: {
    type: String,
    required: false
  },
  created: {
    type: Date,
    default: Date.now,
    required: true
  },
  updated: {
    type: Date,
    default: Date.now,
    required: true
  }
});

// Add unique keys
UserPolicySchema.index({ _user: 1, _resource: 1, _permission: 1 }, { unique: true });

// Export the Mongoose model
module.exports = mongoose.model('UserPolicy', UserPolicySchema);
