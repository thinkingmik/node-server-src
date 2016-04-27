var User = require('../models/userModel');
var Role = require('../models/roleModel');
//var UserRole = require('../models/userRole');
var Permission = require('../models/permissionModel');
var Resource = require('../models/resourceModel');
//var UserPolicy = require('../models/userPolicy');
var NotFoundError = require('../exceptions/notFoundError');
var handleError = require('../utils/handleJsonResponse').Error;
var handleSuccess = require('../utils/handleJsonResponse').Success;

//Create an user
var addUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var email = req.body.email;
  var firstName = req.body.firstName;
  var lastName = req.body.lastName;

  var user = new User({
    username: username,
    password: password,
    email: email,
    firstName: firstName,
    lastName: lastName
  });

  user.save()
  .then(function(ret) {
    handleSuccess(res, ret);
  })
  .catch(function(err) {
    handleError(res, err);
  });
}

//Get an user by id
var getUser = function(req, res) {
  var userId = req.params.user;

  if (userId) {
    User.forge()
    .where({
      id: userId
    })
    .fetch()
    .then(function(ret) {
      handleSuccess(res, ret);
    })
    .catch(function(err) {
      handleError(res, err);
    });
  }
  else {
    return getUsers(req, res);
  }
}

//Get all users
var getUsers = function(req, res) {
  User.collection()
  .fetch()
  .then(function(ret) {
    handleSuccess(res, ret);
  })
  .catch(function(err) {
    handleError(res, err);
  });
}

//Delete an user by id
var delUser = function(req, res) {
  var userId = req.params.user;

  if (userId) {
    User.remove({
      id: userId
    })
    .then(function(ret) {
      handleSuccess(res, ret);
    })
    .catch(function(err) {
      handleError(res, err);
    });
  }
}

//Add a role to an user
var addUserRole = function(req, res) {
  var userId = req.params.user;
  var idRole = req.body.role;
  var main = req.body.main;
  var expiration = req.body.expiration;
  var description = req.body.description;

  var userRole = new UserRole({
    _user: userId,
    _role: idRole,
    main: main,
    expiration: expiration,
    description: description
  });

  userRole.saveAsync()
  .then(function(ret) {
    handleSuccess(res, ret);
  })
  .catch(function(err) {
    handleError(res, err);
  });
}

//Remove a role by id associated to an user
var delUserRole = function(req, res) {
  var userId = req.params.user;
  var idRole = req.params.role;

  if (idRole) {
    UserRole.removeAsync({
      _user: userId,
      _role: idRole
    })
    .then(function(ret) {
      handleSuccess(res, ret);
    })
    .catch(function(err) {
      handleError(res, err);
    });
  }
  else {
    return delUserRoles(req, res);
  }
}

//Remove all roles associated to an user
var delUserRoles = function(req, res) {
  var userId = req.params.user;

  UserRole.removeAsync({
    _user: userId
  })
  .then(function(ret) {
    handleSuccess(res, ret);
  })
  .catch(function(err) {
    handleError(res, err);
  });
}

//Get a role by id associated to an user
var getUserRole = function(req, res) {
  var userId = req.params.user;
  var idRole = req.params.role;

  if (idRole) {
    UserRole.findOne({
      _user: userId,
      _role: idRole,
    })
    .populate('_role')
    .then(function(ret) {
      handleSuccess(res, ret);
    })
    .catch(function(err) {
      handleError(res, err);
    });
  }
  else {
    return getUserRoles(req, res);
  }
}

//Get all roles associated to an user
var getUserRoles = function(req, res) {
  var userId = req.params.user;

  UserRole.find({
    _user: userId
  })
  .populate('_role')
  .then(function(ret) {
    handleSuccess(res, ret);
  })
  .catch(function(err) {
    handleError(res, err);
  });
}

//Add a policy to an user
var addUserPolicy = function(req, res) {
  var userId = req.params.user;
  var idRes = req.body.resource;
  var idPerm = req.body.permission;
  var description = req.body.description;
  var expiration = req.body.expiration;

  var userPolicy = new UserPolicy({
    _user: userId,
    _resource: idRes,
    _permission: idPerm,
    description: description,
    expiration: expiration
  });

  userPolicy.saveAsync()
  .then(function(ret) {
    handleSuccess(res, ret);
  })
  .catch(function(err) {
    handleError(res, err);
  });
}

//Remove a policy by id associated to an user
var delUserPolicy = function(req, res) {
  var userId = req.params.user;
  var idRes = req.params.resource;
  var idPerm = req.params.permission;

  if (idRes == 'all') {
    idRes = null;
  }

  if (idRes && idPerm) {
    UserPolicy.removeAsync({
      _user: userId,
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
    return delUserResources(req, res);
  }
  else if (!idRes && idPerm) {
    return delUserPermissions(req, res);
  }
  else {
    return delUserPolicies(req, res);
  }
}

//Remove all policies associated to an user
var delUserPolicies = function(req, res) {
  var userId = req.params.user;

  UserPolicy.removeAsync({
    _user: userId
  })
  .then(function(ret) {
    handleSuccess(res, ret);
  })
  .catch(function(err) {
    handleError(res, err);
  });
}

//Remove all resources associated to an user
var delUserResources = function(req, res) {
  var userId = req.params.user;
  var idRes = req.params.resource;

  UserPolicy.removeAsync({
    _user: userId,
    _resource: idRes
  })
  .then(function(ret) {
    handleSuccess(res, ret);
  })
  .catch(function(err) {
    handleError(res, err);
  });
}

//Remove all permissions associated to an user
var delUserPermissions = function(req, res) {
  var userId = req.params.user;
  var idPerm = req.params.permission;

  UserPolicy.removeAsync({
    _user: userId,
    _permission: idPerm
  })
  .then(function(ret) {
    handleSuccess(res, ret);
  })
  .catch(function(err) {
    handleError(res, err);
  });
}

//Get a policy by id associated to an user
var getUserPolicy = function(req, res) {
  var userId = req.params.user;
  var idRes = req.params.resource;
  var idPerm = req.params.permission;

  if (idRes == 'all') {
    idRes = null;
  }

  if (idRes && idPerm) {
    UserPolicy.findOne({
      _user: userId,
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
    return getUserResources(req, res);
  }
  else if (!idRes && idPerm) {
    return getUserPermissions(req, res);
  }
  else {
    return getUserPolicies(req, res);
  }
}

//Get all policies associated to an user
var getUserPolicies = function(req, res) {
  var userId = req.params.user;

  UserPolicy.find({
    _user: userId
  })
  .populate(['_resource', '_permission'])
  .then(function(ret) {
    handleSuccess(res, ret);
  })
  .catch(function(err) {
    handleError(res, err);
  });
}

//Get all resources associated to an user
var getUserResources = function(req, res) {
  var userId = req.params.user;
  var idRes = req.params.resource;

  UserPolicy.find({
    _user: userId,
    _resource: idRes
  })
  .populate(['_resource', '_permission'])
  .then(function(ret) {
    handleSuccess(res, ret);
  })
  .catch(function(err) {
    handleError(res, err);
  });
}

//Get all permissions associated to an user
var getUserPermissions = function(req, res) {
  var userId = req.params.user;
  var idPerm = req.params.permission;

  UserPolicy.find({
    _user: userId,
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

exports.createUser = addUser;
exports.deleteUser = delUser;
exports.getUser = getUser;
exports.addUserRole = addUserRole;
exports.removeUserRole = delUserRole;
exports.getUserRole = getUserRole;
exports.addUserPolicy = addUserPolicy;
exports.removeUserPolicy = delUserPolicy;
exports.getUserPolicy = getUserPolicy;
