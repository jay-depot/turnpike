var domain = require('domain');
var Driver = require('./Drive').Driver;
var AutoLoader = require ('./AutoLoader');
var parse_action = require('./ActionParser').parse;
var Connection = require('./Connection');
var url = require('url');
var Router = require('./Router');

function turnpike_server() {
  return function(req, res) {
    var d = domain.create();

    d.on('error', function(er){
      console.error('Error encountered in connection handler', er.stack);
      try {
        var countdown = setTimeout(function(){
          process.exit(1);
        }, 30000);
        countdown.unref();
        Driver.server.close();
        cluser.worker.disconnect();
        res.writeHead(500, "Unknown fatal server error", {'Content-Type': 'text/plain'});
        res.end("500\nInternal server error.");
      }
      catch (er2) {
        console.error('Failure sending 500 status during error handler'. er2.stack);
      }
    });

    d.add(req);
    d.add(res);
    d.run(function(){
      var connection = new Connection(req, res);
      connection.end(function(){
        console.log("Serving: " + req.url);
        Router.resolve(
          function(err, route) {
            route_handler(connection, err, route)
          },
          url.parse(req.url).pathname);
      });
    });
  };
}

function route_handler(connection, err, route) {
  var controller,
      http_method = connection.method,
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
    action = controller.method;

    if (controller.instance) {
      controller = AutoLoader.invoke(controller.classname);
      controller = new controller(connection);
      action = (controller[action]).bind(controller);
    }
    else {
      controller = AutoLoader.invoke(controller.classname);
      action = function(cb) {
        controller[action](connection, cb);
      }
    }
  }
  else {
    controller = AutoLoader.invoke(connection.route.controller);
    controller = new controller(connection);
    action = controller.prepare;
  }

  if (typeof(action) == "function" ) {
    connection.controller = controller;
    action(controller.deliver);
  }
  else {
    connection.die(404);
  }
}

module.exports = turnpike_server;
