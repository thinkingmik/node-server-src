
var isAllowed = function(req, res, next) {
  //Get userId by token or basic auth in req header

  //Get all user's policies
  //Get all user's roles
  //Get all roles' policies

  //Check if user has the policy

  return next();
}

exports.isAllowed = isAllowed;
