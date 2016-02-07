var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define our resource schema
var ResourceSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true
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

// Export the Mongoose model
module.exports = mongoose.model('Resource', ResourceSchema);
