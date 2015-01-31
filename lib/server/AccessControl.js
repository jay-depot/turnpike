var action_helpers = require('../internal/action_helpers');
var async = require('async');

AccessControl = (function() {
  var rules = {};

  return {
    addRules: function (controller, imported) {
      if (typeof(controller) === 'string') {
        //controller must be a string matching the name of a controller class.
        rules[controller] = imported;
      }
    },

    checkAccess: function (action, connection, callback) {
      action = action_helpers.parse(action);

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
              rules[action.classname](connection, next);
            }
            else {
              next(undefined, rules[action.classname]);
            }
          },
          function(access, next) {
            if (rules[action.classname][action.method]) {
              if (typeof(rules[action.classname][action.method]) === 'function') {
                rules[action.classname][action.method](connection, next);
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
        if (require('./../config').testing) {
          console.warn(action.classname + ' has no access rules defined. All ' +
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
    }
  }
})();

module.exports = AccessControl;
