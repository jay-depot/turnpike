/**
 * The Turnpike.drive() function. After everything is set up, this starts the Turnpike server.
 */

var config = require('./../config');
var cluster = require('cluster');
var express = require('express');
var async = require('async');
var Driver = require('./Driver');
var driver = new Driver();

function drive() {
  require(process.cwd() + '/application/init.js');

  if (cluster.isMaster && !config.testing) {
    driver.fork(function(err, workers) {
      console.log('=== ' + workers + ' workers are now driving on the Turnpike! ===');
      console.log('The turnpike is now open on port ' + config.port);
    });
  }
  else {
    async.waterfall([
      function(next) {
        driver.loadConfig(next);
      },
      function(next) {
        driver.startAutoloader(next);
      },
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
          .use(domainWrapper(driver.server))
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
}

module.exports = drive;
module.exports.driver = driver;
