var express = require('express');
var authMiddleware = require('../middlewares/auth');
var aclMiddleware = require('../middlewares/acl');
var userController = require('../controllers/acl/user');
var roleController = require('../controllers/acl/role');
var resourceController = require('../controllers/acl/resource');
var permissionController = require('../controllers/acl/permission');
var router = express.Router();

router.route('/users')
  .post(authMiddleware.isAuthenticated, userController.createUser);
router.route('/users/:user?')
  .delete(authMiddleware.isAuthenticated, userController.deleteUser)
  .get(authMiddleware.isAuthenticated, aclMiddleware.isAllowed('getUser'), userController.getUser);

router.route('/users/:user/roles')
  .post(authMiddleware.isAuthenticated, userController.addUserRole);
router.route('/users/:user/roles/:role?')
  .delete(authMiddleware.isAuthenticated, userController.removeUserRole)
  .get(authMiddleware.isAuthenticated, userController.getUserRole);

router.route('/users/:user/policies')
  .post(authMiddleware.isAuthenticated, userController.addUserPolicy);
router.route('/users/:user/policies/:resource?/:permission?')
  .delete(authMiddleware.isAuthenticated, userController.removeUserPolicy)
  .get(authMiddleware.isAuthenticated, userController.getUserPolicy);

router.route('/roles')
  .post(authMiddleware.isAuthenticated, roleController.createRole);
router.route('/roles/:role?')
  .delete(authMiddleware.isAuthenticated, roleController.deleteRole)
  .get(authMiddleware.isAuthenticated, roleController.getRole);

router.route('/roles/:role/policies')
  .post(authMiddleware.isAuthenticated, roleController.addRolePolicy);
router.route('/roles/:role/policies/:resource?/:permission?')
  .delete(authMiddleware.isAuthenticated, roleController.removeRolePolicy)
  .get(authMiddleware.isAuthenticated, roleController.getRolePolicy);

router.route('/resources')
  .post(authMiddleware.isAuthenticated, resourceController.createResource);
router.route('/resources/:resource?')
  .delete(authMiddleware.isAuthenticated, resourceController.deleteResource)
  .get(authMiddleware.isAuthenticated, resourceController.getResource);

router.route('/permissions')
  .post(authMiddleware.isAuthenticated, permissionController.createPermission);
router.route('/permissions/:permission?')
  .delete(authMiddleware.isAuthenticated, permissionController.deletePermission)
  .get(authMiddleware.isAuthenticated, permissionController.getPermission);

module.exports = router;
