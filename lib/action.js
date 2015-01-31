var actionHelpers = require('./internal/action_helpers');
var _ = require('./imports').underscore;

/**
 * Returns a route handler with access checking from an action string.
 * @namespace turnpike.action
 * @param action_path
 * @returns {Function}
 */
var action = function accessChecked(action_path) {
  var AccessControl = require('./server/AccessControl');
  var handler = action.unchecked(action_path);

  return action.csurfWrap(function(connection) {
    AccessControl.checkAccess(action_path, connection, function(err, allow) {
      if (allow) {
        handler(connection);
      }
      else {
        connection.die(403, 'Access denied');
      }
    })
  });
};

action.accessChecked = action;

/**
 * Returns a route handler with NO ACCESS CHECKING from an action string.
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
 * Wraps a route handler with CSRF protection. Of course, this requires sessions enabled.
 *
 * This is already done for you by default if you use action() or action.accessChecked().
 * @param {function} handler
 * @returns {function}
 */
action.csurfWrap = function(handler) {
  var SessionWrapper = require('./server/middleware/SessionWrapper');
  var csurf = SessionWrapper.csrf();

  if (SessionWrapper.csrf.state) {
    return function(connection) {
      csurf(connection.req, connection.res, function(err) {
        if (err) {
          connection.die(500);
        }
        else {
          handler(connection);
        }
      });
    }
  }
  else return handler;
};

/**
 * Wrap a route action such that it will accept multipart form data and file uploads.
 *
 * Be sure to clean up the temp files when you're done.
 *
 * @param {function} callback
 * @returns {function}
 */
action.acceptUploads = function acceptUploads(callback) {
  return function(connection) {
    var uploadHandler = require('./server/middleware/uploadHandler');

    uploadHandler(connection, function(err, connection) {
      if (err) {
        connection.die(500);
      }
      else {
        callback(connection);
      }
    });
  };
};

module.exports = action;
