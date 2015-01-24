var actionHelpers = require('./internal/action_helpers');
var _ = require('./imports').underscore;
var action = {};

/**
 * Returns a route handler with NO ACCESS CHECKING from an action string.
 *
 * @namespace turnpike.action
 * @param {String} action_path
 *
 * @returns {function}
 */
action.unchecked = function unchecked(action_path) {
  var parsedAction = actionHelpers.parse(action_path);
  var handler;
  var turnpike = require('./index');

  if (typeof parsedAction === 'string') {
    //we have a legacy controller
    handler = function(connection) {
      connection.controller = new turnpike.application.controllers[parsedAction](connection);
      connection.controller.prepare.call(handler, connection.controller.deliver);
    };
  }
  else if (parsedAction.instance) {
    handler = function(connection) {
      connection.controller = new turnpike.application.controllers[parsedAction.classname](connection);
      connection.controller.mode = _.underscored(parsedAction.method);
      actionHelpers.bind_route_parameters(
        turnpike.application.controllers[parsedAction.classname].prototype[parsedAction.method],
        connection.controller[parsedAction.method].bind(connection.controller),
        connection.req.params
      )(connection.controller.deliver);
    }
  }
  else {
    handler = function(connection) {
      connection.controller = turnpike.application.controllers[parsedAction.classname](connection);
      connection.controller.mode = _.underscored(parsedAction.method);
      connection.controller[parsedAction.method].call(handler, connection.controller.deliver);
    }
  }

  return handler;
};

/**
 * Returns a route handler with access checking from an action string.
 *
 * @param action_path
 * @returns {Function}
 */
action.accessChecked = function accessChecked(action_path) {
  var AccessControl = require('./server/AccessControl');
  var handler = action.unchecked(action_path);

  return function(connection) {
    AccessControl.checkAccess(action_path, connection, function(err, allow) {
      if (allow) {
        handler(connection);
      }
      else {
        connection.die(403, 'Access denied');
      }
    })
  };
};

module.exports = action;
