var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define our user-role schema
var UserRoleSchema = new mongoose.Schema({
  _user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  _role: {
    type: Schema.Types.ObjectId,
    ref: 'Role'
  },
  main: {
    type: Boolean,
    default: false,
    required: false
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
UserRoleSchema.index({ _user: 1, _role: 1 }, { unique: true });

// Export the Mongoose model
module.exports = mongoose.model('UserRole', UserRoleSchema);
