var Driver = require('./Driver').Driver;

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
  var controller;
  connection.route = route;
  controller = AutoLoader.invoke(connection.route.controller);
  if (typeof(controller) == "function" ) {
    connection.controller = controller = new controller(connection);
    controller.prepare(controller.deliver);
  }
  else {
    connection.die(404);
  }
}

module.exports = turnpike_server;
