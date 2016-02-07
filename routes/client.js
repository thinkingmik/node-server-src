var express = require('express');
var authMiddleware = require('../middlewares/auth');
var clientController = require('../controllers/client');
var router = express.Router();

router.route('/clients')
  .post(authMiddleware.isAuthenticated, clientController.postClients)
  .get(authMiddleware.isAuthenticated, clientController.getClients);

module.exports = router;
