/**
 * The Turnpike.drive() function. After everything is set up, this starts the Turnpike server.
 */

var config = require('./../config');
var UploadHandler = require('./middleware/UploadHandler');
var cluster = require('cluster');
var fs = require('fs-extra');
var _ = require('underscore');
var hooks = require('hooks');
var driver = new Driver();
var express = require('express');
var async = require('async');

function Driver() {}

for (var k in hooks) {
  //noinspection JSUnfilteredForInLoop
  Driver.prototype[k] = Driver[k] = hooks[k];
}

Driver.prototype.loadConfig = function(cb) {
  config.initialize();
  process.nextTick(function(){
    cb(false);
  });
};

Driver.prototype.buildRouter = function(cb) {
  var routes     = fs.readJSONSync('./routes.json');
  require('./Router').routes(routes);
  process.nextTick(function() {
    cb(false);
  });
};

Driver.prototype.startAutoloader = function(cb) {
 var cwd        = process.cwd();
 var autoLoader = require ('./../internal/autoLoader');

  autoLoader.scandir(cwd);
  process.nextTick(function() {
    cb(false);
  });
};

Driver.prototype.startServer = function(app, cb) {
  var turnpike_server = require('./turnpike_server');
  var Session = require('./middleware/SessionWrapper');

  app.use(UploadHandler()).
      use(Session.turnpikeSession()).
      use(Session.csrf()).
      use(turnpike_server());


  this.server.listen(config.port);

  if (typeof(cb) === 'function') {
    cb(false);
  }
};

Driver.prototype.fork = function(cb) {
  var workers = require('os').cpus().length
    , active = 0
    , initialForks = true
    , maxProcs = workers + config.max_spare_procs; //Not used yet.

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
};

var drive = function() {
  require(process.cwd() + '/application/init.js');

  if (cluster.isMaster && !config.testing) {
    driver.fork(function(err, workers) {
      console.log('=== ' + workers + ' workers are now driving on the Turnpike! ===');
      console.log('The turnpike is now open on port ' + config.port);
    });
  }
  else {
    async.waterfall([
      driver.loadConfig,
      driver.buildRouter,
      driver.startAutoloader,
      function(next) {
        var domainWrapper = require('./middleware/domainWrapper');
        var app = express();
        var logger = require('morgan');
        var log_format = config.testing ? 'dev' : 'common';
        var serve_static = express.static;
        var cookieParser = require('cookie-parser');
        var bodyParser = require('body-parser');

        driver.server = require('http').createServer(app);
        app
          .use(domainWrapper(this.server))
          .use(logger(log_format))
          .use(serve_static('public', {'index': false}))
          .use(cookieParser())
          .use(bodyParser.json({}))
          .use(bodyParser.urlencoded({extended: true}));
        next(false, app);
      }.bind(this)
    ], function(err, app) {
      driver.startServer(app, function(){});
    });
  }
};

module.exports = drive;
module.exports.driver = driver;
