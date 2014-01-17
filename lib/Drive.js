/**
 * The Turnpike.drive() function. After everything is set up, this starts the Turnpike server.
 */

var GlobalConfig = require('./GlobalConfig');
var cluster = require('cluster');
var fs = require('fs-extra');
var _ = require('underscore');
var hooks = require('hooks');
var driver;

function Driver() {}

for (var k in hooks) {
  Driver[k] = hooks[k];
}

Driver.loadConfig = Driver.hook('loadConfig', function(cb) {
  GlobalConfig.initialize();
  process.nextTick(function(){
    cb();
  });
});

Driver.buildRouter = Driver.hook('buildRouter', function(cb) {
  var routes     = fs.readJSONSync('./routes.json');
  require('./Router').routes(routes);
  process.nextTick(function() {
    cb();
  });
});

Driver.startAutoloader = Driver.hook('startAutoloader', function(cb) {
 var path       = require('path');
 var libdir     = path.dirname(module.filename);
 var cwd        = process.cwd();
 var AutoLoader = require ('./AutoLoader');

  AutoLoader.scandir(libdir);
  AutoLoader.scandir(cwd);
  process.nextTick(function() {
    cb();
  });
});

Driver.startServer = Driver.hook('startServer', function() {
  var domain = require('domain');
  var Router = require('./Router');
  var url = require('url');
  var http = require('http');
  var Connection = require('./Connection');
  var AutoLoader = require("./AutoLoader"), controller;

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
        Router.resolve(function(err, route){
          connection.route = route;
          controller = connection.controller = AutoLoader.invoke(connection.route.controller);
          if (typeof(controller) == "function" ) {
            controller = new controller(connection);
            controller.prepare(controller.deliver);
          }
          else {
            connection.die(404);
          }
        },url.parse(req.url).pathname);
      });
    });
  }).listen(GlobalConfig.port);
});

Driver.fork = Driver.hook('fork', function(cb) {
  var workers = Math.max(require('os').cpus().length + 1, 3)
    , active = 0
    , initialForks = true;
  console.log('Setting up workers.');
  cluster.on('fork', function(worker) {
    console.log('Created worker: ' + worker.id);
    if (++active == workers && initialForks) {
      initialForks = false;
      cb(workers);
    }
  });
  cluster.on('disconnect', function(worker) {
    active--;
    console.error('Worker ' + worker.id + ' crashed!');
    console.log('Replacing crashed worker ' + worker.id + ' in 3 seconds.\n' + active +
      ' functioning workers until replacement spawns.');
    setTimeout(function(){ cluster.fork(); }, 3000);
  });
  for (var i = 0; i < workers; i++) {
    cluster.fork();
  }
});

driver = new Driver()

var drive = function() {
  if (cluster.isMaster && !GlobalConfig.testing) {
    driver.fork(function(workers) {
      console.log('=== ' + workers + ' workers are now driving on the Turnpike! ===');
      console.log('The turnpike is now open on port ' + GlobalConfig.port);
    });
  }
  else {
    process.nextTick(function() {
      driver.loadConfig(function() {
        driver.buildRouter(function() {
          driver.startAutoloader(function() {
            driver.startServer();
          });
        });
      });
    });
  }
};

module.exports.drive = drive;
module.exports.Driver = {};
module.exports.Driver.pre = driver.pre;
module.exports.Driver.post = driver.post;
