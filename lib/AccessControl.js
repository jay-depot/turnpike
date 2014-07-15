var ActionParser = require('./ActionParser');
var async = require('async');

function AccessControl() {
  var rules = {};

  this.addRules = function (controller, imported) {
    if (typeof(controller) === 'string') {
      //controller must be a string matching the name of a controller class.
      rules[controller] = imported;
    }
  };

  this.checkAccess = function (route, connection, callback) {
    var action = ActionParser.parse(route.controller);

    if (typeof(action) === 'string') {
      action = {
        classname : action,
        method    : ''
      };
    }

    //Access rules can be defined at the controller level
    if (rules[action.classname]) {
      async.waterfall([
        function(next) {
          var access;
          if (typeof(rules[action.classname]) === 'function') {
            if (rules[action.classname].length === 1) {
              console.warn('Access rule for ' + action.classname + ' is synchronous. This construction is deprecated!');
              try {
                access = rules[action.classname]();
              }
              catch (e) {
                next(e);
                return;
              }
              next(undefined, access);
            }
            else {
              rules[action.classname](route, next);
            }
          }
          else {
            next(undefined, rules[action.classname]);
          }
        },
        function(access, next) {
          if (rules[action.classname][action.method]) {
            if (typeof(rules[action.classname][action.method]) === 'function') {
              if (rules[action.classname][action.method].length < 3) {
                console.warn('Access rule for ' + route.controller + ' is synchronous. This construction is deprecated!');
                try {
                  access = rules[action.classname][action.method](route, connection);
                }
                catch (e) {
                  next(e);
                  return;
                }
                next(undefined, access);
              }
              else {
                rules[action.classname][action.method](route, connection, next);
              }
            }
            else {
              next(undefined, rules[action.classname][action.method]);
            }
          }
          else {
            next(undefined, access);
          }
        }
      ], function(err, res) {
        process.nextTick(function(){ callback(err, res); });
      });
    }
    else {
      //No rules for this controller
      //Allow all if we're in test mode, but log a warning. Otherwise, deny all.
      if (require('./GlobalConfig').testing) {
        console.warn(route.controller + ' has no access rules defined. All ' +
          'access to this controller will be DENIED in production use.');
        process.nextTick(function(){
          callback(undefined, true);
        });
      }
      else {
        process.nextTick(function() {
          callback(undefined, false);
        });
      }
    }
  };
}

module.exports.AccessControl = function() {
  return new AccessControl();
}
