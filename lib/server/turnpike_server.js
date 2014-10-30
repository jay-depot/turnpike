var parse_action  = require('./ActionParser').parse;
var Connection    = require('./../classes/Connection');
var accessControl = require('./AccessControl');
var url           = require('url');
var Router        = require('./Router');
var _             = require('./../imports').underscore;

function turnpike_server() {
  return function(req, res, next) {
    var connection = new Connection(req, res, next);
    Router.resolve(function(err, route) {
      route_handler(connection, err, route)
    }, url.parse(req.url).pathname);
  };
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
        action = (controller[action]).bind(controller);
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
