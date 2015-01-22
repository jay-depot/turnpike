var actionHelpers = require('./internal/action_helpers');
var _ = require('./imports').underscore;

/**
 * Action parser for routes
 *
 * @namespace turnpike.action
 * @param {String} action_path
 *
 * @returns {function}
 */
function action(action_path) {
  var action = actionHelpers.parse(action_path);
  var handler;
  var turnpike = require('./index');

  if (typeof action === 'string') {
    //we have a legacy controller
    handler = function(connection) {
      connection.controller = new turnpike.application.controllers[action](connection);
      connection.controller.prepare.call(handler, connection.controller.deliver);
    };
  }
  else if (action.instance) {
    handler = function(connection) {
      connection.controller.mode = _.underscored(action.name);
      connection.controller = new turnpike.application.controllers[action.classname](connection);
      actionHelpers.bind_route_parameters(connection.controller.constructor.prototype[action.name],
        connection.controller[action.method].bind(connection.controller),
        connection.req.params
      )(connection.controller.deliver);
    }
  }
  else {
    handler = function(connection) {
      connection.controller.mode = _.underscored(action.name);
      connection.controller = turnpike.application.controllers[action.classname](connection);
      connection.controller[action.method].call(handler, connection.controller.deliver);
    }
  }

  return handler;
}


module.exports = action;
