var express = require('express');
var proxyMiddleware = require('../middlewares/proxyMiddleware');
var authMiddleware = require('../middlewares/authMiddleware');
var oauth2Controller = require('../controllers/oauth2Controller');
var router = express.Router();

router.route('/oauth2/authorize')
  .get(authMiddleware.isAuthenticated, oauth2Controller.authorization)
  .post(authMiddleware.isAuthenticated, oauth2Controller.decision);

router.route('/oauth2/token')
  .post(proxyMiddleware.fillClientCredentials, authMiddleware.isClientAuthenticated, oauth2Controller.token);

router.route('/oauth2/logout')
  .post(authMiddleware.isAuthenticated, oauth2Controller.logout);

router.route('/oauth2/test')
  .get(authMiddleware.isAuthenticated, oauth2Controller.test)

module.exports = router;
