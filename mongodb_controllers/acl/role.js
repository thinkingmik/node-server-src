var Role = require('../../models/acl/role');
var Permission = require('../../models/acl/permission');
var Resource = require('../../models/acl/resource');
var NotFoundError = require('../../exceptions/notFoundError');
var handleError = require('../../utils/handleJsonResponse').Error;
var handleSuccess = require('../../utils/handleJsonResponse').Success;

//Create a role
var addRole = function(req, res) {
  var name = req.body.name;
  var description = req.body.description;

  var role = new Role({
    name: name,
    description: description
  });

  role.saveAsync()
  .spread(function(ret) {
    handleSuccess(res, ret);
  })
  .catch(function(err) {
    handleError(res, err);
  });
}

//Get a role by id
var getRole = function(req, res) {
  var idRole = req.params.role;

  if (idRole) {
    Role.findOneAsync({
      _id: idRole
    })
    .then(function(ret) {
      return res.json(ret)
    })
    .catch(function(err) {
      handleError(res, err);
    });
  }
  else {
    return getRoles(req, res);
  }
}

//Get all roles
var getRoles = function(req, res) {
  Role.findAsync()
  .then(function(ret) {
    return res.json(ret)
  })
  .catch(function(err) {
    handleError(res, err);
  });
}

//Delete a role by id
var delRole = function(req, res) {
  var idRole = req.params.role;

  if (idRole) {
    Role.removeAsync({
      _id: idRole
    })
    .then(function(ret) {
      handleSuccess(res, ret);
    })
    .catch(function(err) {
      handleError(res, err);
    });
  }
  else {
    return delRoles(req, res);
  }
}

//Delete all roles
var delRoles = function(req, res) {
  Role.removeAsync()
  .then(function(ret) {
    handleSuccess(res, ret);
  })
  .catch(function(err) {
    handleError(res, err);
  });
}

exports.createRole = addRole;
exports.deleteRole = delRole;
exports.getRole = getRole;
