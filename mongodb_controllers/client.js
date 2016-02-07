var Client = require('../models/client');

// Create endpoint /api/client for POST
exports.postClients = function(req, res) {
  // Create a new instance of the Client model
  var client = new Client();

  // Set the client properties that came from the POST data
  client.name = req.body.name;
  client.secret = req.body.secret;
  client.domain = req.body.domain;

  // Save the client and check for errors
  client.save(function(err) {
    if (err) {
      res.send(err);
    }

    res.json({ message: 'Client added into the system!', data: client });
  });
};

// Create endpoint /api/clients for GET
exports.getClients = function(req, res) {
  // Use the Client model to find all clients
  Client.find({
    name: req.client.name
  }, function(err, clients) {
    if (err) {
      res.send(err);
    }

    res.json(clients);
  });
};
