var Permission = require('../../models/acl/permission');
var NotFoundError = require('../../exceptions/notFoundError');
var handleError = require('../../utils/handleJsonResponse').Error;
var handleSuccess = require('../../utils/handleJsonResponse').Success;

//Create a permission
var addPermission = function(req, res) {
  var name = req.body.name;
  var description = req.body.description;

  var permission = new Permission({
    name: name,
    description: description
  });

  permission.saveAsync()
  .then(function(ret) {
    handleSuccess(res, ret);
  })
  .catch(function(err) {
    handleError(res, err);
  });
}

//Get a permission by id
var getPermission = function(req, res) {
  var idPerm = req.params.permission;

  if (idPerm) {
    Permission.findOneAsync({
      _id: idPerm
    })
    .then(function(ret) {
      return res.json(ret)
    })
    .catch(function(err) {
      handleError(res, err);
    });
  }
  else {
    return getPermissions(req, res);
  }
}

//Get all permissions
var getPermissions = function(req, res) {
  Permission.findAsync()
  .then(function(ret) {
    return res.json(ret)
  })
  .catch(function(err) {
    handleError(res, err);
  });
}

//Delete a permission by id
var delPermission = function(req, res) {
  var idPerm = req.params.name;

  if (idPerm) {
    Permission.removeAsync({
      _id: idPerm
    })
    .then(function(ret) {
      handleSuccess(res, ret);
    })
    .catch(function(err) {
      handleError(res, err);
    });
  }
  else {
    return delPermissions(req, res);
  }
}

//Delete all permissions
var delPermissions = function(req, res) {
  Permission.removeAsync()
  .then(function(ret) {
    handleSuccess(res, ret);
  })
  .catch(function(err) {
    handleError(res, err);
  });
}

exports.createPermission = addPermission;
exports.getPermission = getPermission;
exports.deletePermission = delPermission;
