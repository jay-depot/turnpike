/**
 * The Turnpike.drive() function. After everything is set up, this starts the Turnpike server.
 */

var GlobalConfig = require('./../config');
var UploadHandler = require('./middleware/UploadHandler');
var cluster = require('cluster');
var fs = require('fs-extra');
var _ = require('underscore');
var hooks = require('hooks');
var driver = new Driver();
var connect = require('connect');
var async = require('async');

function Driver() {}

for (var k in hooks) {
  Driver.prototype[k] = Driver[k] = hooks[k];
}

Driver.hook('loadConfig', function(cb) {
  GlobalConfig.initialize();
  process.nextTick(function(){
    cb(false);
  });
});

Driver.hook('buildRouter', function(cb) {
  var routes     = fs.readJSONSync('./routes.json');
  require('./Router').routes(routes);
  process.nextTick(function() {
    cb(false);
  });
});

Driver.hook('startAutoloader', function(cb) {
 var path       = require('path');
 var libdir     = path.dirname(module.filename);
 var cwd        = process.cwd();
 var AutoLoader = require ('./../internal/autoLoader');

  autoLoader.scandir(libdir);
  autoLoader.scandir(cwd);
  process.nextTick(function() {
    cb(false);
  });
});

Driver.hook('startServer', function(app, cb) {
  var http = require('http');
  var turnpike_server = require('./turnpike_server');
  var Session = require('./middleware/SessionWrapper');

  app.use(UploadHandler()).
      use(Session.turnpikeSession()).
      use(Session.csrf()).
      use(turnpike_server());

  this.server = http.createServer(app);
  this.server.listen(GlobalConfig.port);

  if (typeof(cb) === 'function') {
    cb(false);
  }
});

Driver.hook('fork', function(cb) {
  var workers = require('os').cpus().length
    , active = 0
    , initialForks = true
    , maxProcs = workers + GlobalConfig.max_spare_procs; //Not used yet.

  console.log('Setting up workers.');
  cluster.on('fork', function(worker) {
    console.log('Created worker: ' + worker.id);
    if (++active == workers && initialForks) {
      initialForks = false;
      cb(false, workers);
    }
  });
  cluster.on('disconnect', function(worker) {
    active--;
    console.error('Worker ' + worker.id + ' crashed!');
    console.log('Replacing crashed worker ' + worker.id + ' in 1 second.\n' + active +
      ' functioning workers until replacement spawns.');
    setTimeout(function(){ cluster.fork(); }, 1000);
  });
  for (var i = 0; i < workers; i++) {
    cluster.fork();
  }
});

var drive = function() {
  require(process.cwd() + '/application/init.js');

  if (cluster.isMaster && !GlobalConfig.testing) {
    driver.fork(function(err, workers) {
      console.log('=== ' + workers + ' workers are now driving on the Turnpike! ===');
      console.log('The turnpike is now open on port ' + GlobalConfig.port);
    });
  }
  else {
    async.waterfall([
      driver.loadConfig,
      driver.buildRouter,
      driver.startAutoloader,
      function(next) {
        var app = connect().
          use(connect.logger({'buffer': false, 'immediate': true})).
          use(connect.favicon()).
          use(connect.static('public')).
          use(connect.cookieParser()).
          use(connect.urlencoded()).
          use(connect.json()).
          use(connect.query());
        next(app);
      }
    ], function(err, app) {
      driver.startServer(app, function(){});
    });
  }
};

module.exports.drive = drive;
module.exports.Driver = driver;
