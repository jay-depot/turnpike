/**
 * The Turnpike.drive() function. After everything is set up, this starts the Turnpike server.
 */

var GlobalConfig = require('./GlobalConfig');
var cluster = require('cluster');
var fs = require('fs-extra');



var init = (_.once(function() {
  var routes     = fs.readJSONSync('./routes.json');
  var path       = require('path');
  var libdir     = path.dirname(module.filename);
  var cwd        = process.cwd();
  var AutoLoader = require ('./AutoLoader');

  require('./Router').routes(routes);

  AutoLoader.scandir(libdir);
  AutoLoader.scandir(cwd);
}))();

var drive = function() {
  if (cluster.isMaster && !GlobalConfig.testing) {
    /*
     * Why the extra worker?
     * Since Node is async (usually), this is a valid question, as typically
     * you run just enough workers to have one on each CPU.
     * The spare is there to make sure we can keep serving requests if a
     * worker crashes while we wait for the delayed replacement to complete.
     * Also, some parts of the framework are unfortunately totally Sync, like
     * the dependency on Bleach. Keeping a spare worker around can let the
     * server keep handling requests in the case that we get caught in one of
     * those sync traps. Ideally, those should all be fixed, and then the
     * spare is only needed for availability.
     */
    var workers = Math.max(require('os').cpus().length + 1, 3)
      , active = 0
      , initialForks = true;
    console.log('Setting up workers.');

    cluster.on('fork', function(worker) {
      console.log('Created worker: ' + worker.id);
      if (++active == workers && initialForks) {
        initialForks = false;
        console.log('=== ' + workers + ' workers are now driving on the Turnpike! ===');
        console.log('The turnpike is now open on port ' + GlobalConfig.port);
      }
    });

    cluster.on('disconnect', function(worker) {
      active--;
      console.error('Worker ' + worker.id + ' crashed!');
      console.log('Replacing crashed worker ' + worker.id + ' in 3 seconds.\n' + active +
        ' functioning workers until replacement spawns.');
      setTimeout(function(){ cluster.fork(); }, 3000);
      // We delay replacement to avoid a possible way to bog the machine down
      // with a TON of extra workers by making them crash while serving long-
      // running requests. This replaces a DOS attack that crashes the box
      // with one that we can recover from very quickly.
    });

    for (var i = 0; i < workers; i++) {
      cluster.fork();
    }
  }
  else {
    var domain = require('domain');
    var Router = require('./Router');
    var url = require('url');
    var http = require('http');
    var Connection = require('./Connection');
    var AutoLoader = require("./AutoLoader"), controller;

    routes_init();

    var server = http.createServer(function(req, res) {
      var d = domain.create();

      d.on('error', function(er){
        console.error('Error encountered in connection handler', er.stack);
        try {
          var countdown = setTimeout(function(){
            process.exit(1);
          }, 30000);
          countdown.unref();
          server.close();
          cluser.worker.disconnect();
          res.statusCode = 500;
          res.setHeader('content-type', 'text/plain');
          res.end('Internal server error.\nThere was a problem handing your request.');
        }
        catch (er2) {
          console.error('Failure sending 500 status during error handler'. er2.stack);
        }
      });

      d.add(req);
      d.add(res);
      d.run(function(){
        var connection = new Connection(req, res);
        var controller;

        connection.end(function(){
          console.log("Serving: " + req.url);
          connection.route = Router.resolve(url.parse(req.url).pathname);
          controller = connection.controller = AutoLoader.invoke(connection.route.controller);
            if (typeof(controller) == "function" ) {
            controller = new controller(connection);
            controller.prepare(controller.deliver);
          }
          else {
            connection.die(404);
          }
        });
      });
    }).listen(GlobalConfig.port);
  }
};

module.exports = drive;
