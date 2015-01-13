var lodash         = require('lodash');
var _              = require('./imports').underscore;
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;

/**
 * Action parser for routes
 *
 * @namespace turnpike.action
 */
function action(action_path) {
  var action = parse(action_path);
  var handler;
  var turnpike = require('./index');

  console.log(typeof action);

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
      bind_route_parameters(connection.controller.constructor.prototype[action.name],
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

function parse(action_path) {
  var ordered;
  if (/^\w+[\#|\.]\w+$/.test(action_path)) {
    action_path = action_path.replace(/(\#|\.)/, '|$&|');
    ordered = action_path.split('|');
    return {'classname': ordered[0], 'method': ordered[2], 'instance': (ordered[1] === '#')};
  }
  else {
    return action_path;
  }
}

function bind_route_parameters(exemplar, action, params) {
  var argument_names = get_param_names(exemplar);
  var len = exemplar.length - 1; //assume last parameter is the callback, which we don't want to bind
  var i, name;

  action = lodash.curry(action, exemplar.length);

  for (i = 0; i < len; i++) {
    name = argument_names[i];
    action = action(params[name]);
  }

  return action;
}

function get_param_names(func) {
  var fnStr = func.toString().replace(STRIP_COMMENTS, '');
  var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);

  if(result === null) {
    result = [];
  }

  return result;
}

module.exports = action;
