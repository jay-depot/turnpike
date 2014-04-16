var ActionParser = require('./ActionParser');

function AccessControl() {
  var rules = {};

  this.addRules = function (controller, imported) {
    if (typeof(controller) === 'string') {
      //controller must be a string matching the name of a controller class.
      rules[controller] = imported;
    }
  };

  this.checkAccess = function (route, connection) {
    var action = ActionParser.parse(route.controller),
        access = false; //default deny all.

    if (typeof(action) === 'string') {
      action = {
        classname : action,
        method    : ''
      };
    }

    //Access rules can be defined at the controller level
    if (rules[action.classname]) {
      if (typeof(rules[action.classname]) === 'function') {
        //Access rules are usually functions, returning true or false.
        access = rules[action.classname](route);
      }
      else {
        access = rules[action.classname]; //Boolean constants are allowed, too
      }

      //And then overridden for specific actions.
      if (rules[action.classname][action.method]) {
        if (typeof(rules[action.classname][action.method]) === 'function') {
          access = rules[action.classname][action.method](route, connection);
        }
        else {
          access = rules[action.classname][action.method];
        }
      }
    }
    else {
      //No rules for this controller
      //Allow all if we're in test mode, but log a warning. Otherwise, deny all.
      if (require('./GlobalConfig').testing) {
        console.warn(route.controller + ' has no access rules defined. All ' +
          'access to this controller will be DENIED in production use.');
        access = true;
      }
    }

    return access;
  };
}

module.exports.AccessControl = function() {
  return new AccessControl();
}
