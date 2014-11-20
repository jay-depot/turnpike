var parse_action   = require('./ActionParser').parse;
var Connection     = require('./../classes/Connection');
var accessControl  = require('./AccessControl');
var url            = require('url');
var Router         = require('./Router');
var _              = require('./../imports').underscore;
var lodash         = require('lodash');
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;

function get_param_names(func) {
  var fnStr = func.toString().replace(STRIP_COMMENTS, '');
  var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);

  if(result === null) {
    result = [];
  }

  return result;
}

function turnpike_server() {
  return function(req, res, next) {
    var connection = new Connection(req, res, next);
    Router.resolve(function(err, route) {
      route_handler(connection, err, route)
    }, url.parse(req.url).pathname);
  };
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

function route_handler(connection, err, route) {
  var controller;
  var http_method = connection.method;
  var action_name;
  var action;
  var turnpike = require('./../index');

  if (http_method === 'DELETE') {
    http_method = "DEL";
  }

  connection.route = route;

  if (typeof(route.controller) === 'object') {
    route.controller = route.controller[http_method];
  }

  controller = parse_action(route.controller);

  if (typeof(controller) !== 'string') {
    action_name = action = controller.method;

    if (controller.instance) {
      controller = new turnpike.application.controllers[controller.classname](connection);
      if (typeof(controller[action]) === 'function') {
        action = controller[action].bind(controller);
        action =
          bind_route_parameters(controller.constructor.prototype[action_name], action, connection.route.params);
      }
    }
    else {
      controller = turnpike.application.controllers[controller.classname];
      action = function(cb) {
        controller[action](connection, cb);
      }
    }

    //by convention, we'll set things up so the view mode matches the name of the action method
    controller.mode = _.underscored(action_name);
  }
  else {
    controller = new turnpike.application.controllers[connection.route.controller](connection);
    action = controller.prepare;
  }

  if (typeof(action) === "function" ) {
    connection.controller = controller;
    connection.end(function() {
      accessControl.checkAccess(route, connection, function(err, access) {
        if (err) {
          connection.die(500);
        }
        else if (access) {
          action(controller.deliver);
        }
        else {
          connection.die(403, 'Access Denied');
        }
      });
    });
    connection.finish();
  }
  else {
    connection.die(404, 'Not found');
  }
}

module.exports = turnpike_server;
