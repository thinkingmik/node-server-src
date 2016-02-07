var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define our role policy schema
var RolePolicySchema = new mongoose.Schema({
  _role: {
    type: Schema.Types.ObjectId,
    ref: 'Role'
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
RolePolicySchema.index({ _role: 1, _resource: 1, _permission: 1 }, { unique: true });

// Export the Mongoose model
module.exports = mongoose.model('RolePolicy', RolePolicySchema);
