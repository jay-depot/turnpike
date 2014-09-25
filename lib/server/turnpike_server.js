var autoLoader   = require('./../internal/autoLoader');
var parse_action = require('./ActionParser').parse;
var Connection   = require('./../classes/Connection');
var url          = require('url');
var Router       = require('./Router');
var _            = require('underscore');

function turnpike_server() {
  return function(req, res, next) {
    var connection = new Connection(req, res, next);
    Router.resolve(function(err, route) {
      route_handler(connection, err, route)
    }, url.parse(req.url).pathname);
  };
}

function route_handler(connection, err, route) {
  var controller,
      http_method = connection.method,
      action_name,
      action;

  if (http_method === 'DELETE') {
    http_method = "DEL";
  }

  connection.route = route;
  console.log(typeof(route.controller));

  if (typeof(route.controller) === 'object') {
    route.controller = route.controller[http_method];
  }

  controller = parse_action(route.controller);

  if (typeof(controller) !== 'string') {
    action_name = action = controller.method;

    if (controller.instance) {
      controller = autoLoader.invoke(controller.classname);
      controller = new controller(connection);
      if (typeof(controller[action]) === 'function') {
        console.dir(action);
        action = (controller[action]).bind(controller);
      }
    }
    else {
      controller = autoLoader.invoke(controller.classname);
      action = function(cb) {
        controller[action](connection, cb);
      }
    }

    //by convention, we'll set things up so the view mode matches the name of the action method
    controller.mode = _.underscored(action_name);
    console.log(controller.mode);
  }
  else {
    controller = autoLoader.invoke(connection.route.controller);
    controller = new controller(connection);
    action = controller.prepare;
  }

  if (typeof(action) === "function" ) {
    connection.controller = controller;
    connection.end(function() {
      autoLoader.accessControl.checkAccess(route, connection, function(err, access) {
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
