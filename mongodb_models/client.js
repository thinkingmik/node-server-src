var mongoose = require('mongoose');

// Define our client schema
var ClientSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true
  },
  secret: {
    type: String,
    unique: true,
    required: true
  },
  domain: {
    type: String,
    required: false
  }
});

// Export the Mongoose model
module.exports = mongoose.model('Client', ClientSchema);
