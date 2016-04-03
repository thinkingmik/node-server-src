var Role = require('../models/roleModel');
var Permission = require('../models/permissionModel');
var Resource = require('../models/resourceModel');
//var RolePolicy = require('../models/rolePolicy');
var NotFoundError = require('../exceptions/notFoundError');
var handleError = require('../utils/handleJsonResponse').Error;
var handleSuccess = require('../utils/handleJsonResponse').Success;

//Create a role
var addRole = function(req, res) {
  var name = req.body.name;
  var description = req.body.description;

  var role = new Role({
    name: name,
    description: description
  });

  role.saveAsync()
  .then(function(ret) {
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

//Get a policy by id associated to a role
var getRolePolicy = function(req, res) {
  var idRole = req.params.role;
  var idRes = req.params.resource;
  var idPerm = req.params.permission;

  if (idRes == 'all') {
    idRes = null;
  }

  if (idRes && idPerm) {
    RolePolicy.findOne({
      _role: idRole,
      _resource: idRes,
      _permission: idPerm
    })
    .populate(['_resource', '_permission'])
    .then(function(ret) {
      handleSuccess(res, ret);
    })
    .catch(function(err) {
      handleError(res, err);
    });
  }
  else if (idRes && !idPerm) {
    return getRoleResources(req, res);
  }
  else if (!idRes && idPerm) {
    return getRolePermissions(req, res);
  }
  else {
    return getRolePolicies(req, res);
  }
}

//Get all policies associated to a role
var getRolePolicies = function(req, res) {
  var idRole = req.params.role;

  RolePolicy.find({
    _role: idRole
  })
  .populate(['_resource', '_permission'])
  .then(function(ret) {
    handleSuccess(res, ret);
  })
  .catch(function(err) {
    handleError(res, err);
  });
}


//Add a policy to a role
var addRolePolicy = function(req, res) {
  var idRole = req.params.role;
  var idRes = req.body.resource;
  var idPerm = req.body.permission;
  var description = req.body.description;
  var expiration = req.body.expiration;

  var rolePolicy = new RolePolicy({
    _role: idRole,
    _resource: idRes,
    _permission: idPerm,
    description: description,
    expiration: expiration
  });

  rolePolicy.saveAsync()
  .then(function(ret) {
    handleSuccess(res, ret);
  })
  .catch(function(err) {
    handleError(res, err);
  });
}

//Remove a policy by id associated to a role
var delRolePolicy = function(req, res) {
  var idRole = req.params.role;
  var idRes = req.params.resource;
  var idPerm = req.params.permission;

  if (idRes == 'all') {
    idRes = null;
  }

  if (idRes && idPerm) {
    RolePolicy.removeAsync({
      _role: idRole,
      _resource: idRes,
      _permission: idPerm
    })
    .then(function(ret) {
      handleSuccess(res, ret);
    })
    .catch(function(err) {
      handleError(res, err);
    });
  }
  else if (idRes && !idPerm) {
    return delRoleResources(req, res);
  }
  else if (!idRes && idPerm) {
    return delRolePermissions(req, res);
  }
  else {
    return delRolePolicies(req, res);
  }
}

//Remove all policies associated to a role
var delRolePolicies = function(req, res) {
  var idRole = req.params.role;

  RolePolicy.removeAsync({
    _role: idRole
  })
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
exports.addRolePolicy = addRolePolicy;
exports.removeRolePolicy = delRolePolicy;
exports.getRolePolicy = getRolePolicy;
