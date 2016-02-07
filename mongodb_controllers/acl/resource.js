var Resource = require('../../models/acl/resource');
var NotFoundError = require('../../exceptions/notFoundError');
var handleError = require('../../utils/handleJsonResponse').Error;
var handleSuccess = require('../../utils/handleJsonResponse').Success;

//Create a resource
var addResource = function(req, res) {
  var name = req.body.name;
  var description = req.body.description;

  var resource = new Resource({
    name: name,
    description: description
  });

  resource.saveAsync()
  .spread(function(ret) {
    handleSuccess(res, ret);
  })
  .catch(function(err) {
    handleError(res, err);
  });
}

//Get a resource by id
var getResource = function(req, res) {
  var idRes = req.params.resource;

  if (idRes) {
    Resource.findOneAsync({
      _id: idRes
    })
    .then(function(ret) {
      return res.json(ret)
    })
    .catch(function(err) {
      handleError(res, err);
    });
  }
  else {
    return getResources(req, res);
  }
}

//Get all resources
var getResources = function(req, res) {
  Resource.findAsync()
  .then(function(ret) {
    return res.json(ret)
  })
  .catch(function(err) {
    handleError(res, err);
  });
}

//Delete a resource by id
var delResource = function(req, res) {
  var idRes = req.params.resource;

  if (idRes) {
    Resource.removeAsync({
      _id: idRes
    })
    .then(function(ret) {
      handleSuccess(res, ret);
    })
    .catch(function(err) {
      handleError(res, err);
    });
  }
  else {
    return delResources(req, res);
  }
}

//Delete all resources
var delResources = function(req, res) {
  Resource.removeAsync()
  .then(function(ret) {
    handleSuccess(res, ret);
  })
  .catch(function(err) {
    handleError(res, err);
  });
}

exports.createResource = addResource;
exports.deleteResource = delResource;
exports.getResource = getResource;
