var config = require('./../config');
var _ = require('lodash');
var hooks = require('hooks');
var async = require('async');

var Driver = function() {
  for (var k in hooks) {
    //noinspection JSUnfilteredForInLoop
    this[k] = hooks[k];
  }
};

Driver.prototype.loadConfig = function(cb) {
  config.initialize();
  process.nextTick(function(){
    cb(false);
  });
};

Driver.prototype.startAutoloader = function(cb) {
  var turnpike    = require('./../index');
  var cwd         = process.cwd();
  var autoLoader  = require('./../internal/autoLoader');
  var path        = require('path');
  var application = autoLoader.load(path.join(cwd, 'application'));

  process.nextTick(function() {
    var k;

    turnpike.application = _.merge(turnpike.application, application);

    for (k in turnpike.application.access)
      if(turnpike.application.access.hasOwnProperty(k)) {
        turnpike.server.AccessControl.addRules(k, turnpike.application.access[k]);
    }

    for (k in turnpike.application.views)
      if (turnpike.application.views.hasOwnProperty(k)) {
        if (typeof turnpike.application.views[k] !== 'function') {
          turnpike.application.views[k] = turnpike.classes.base.view.ViewBuilder(turnpike.application.views[k]);
        }
    }

    cb(false);
  });
};

Driver.prototype.startServer = function(app, cb) {
  var SessionWrapper = require('./middleware/SessionWrapper');
  var turnpike = require('../index');

  this.app = app;

  this.app.use(SessionWrapper.turnpikeSession());

  for (var route in turnpike.application.routes) if (turnpike.application.routes.hasOwnProperty(route)
    && typeof turnpike.application.routes[route] === 'function') {
    turnpike.application.routes[route]();
  }

  require('../router').legacy();
  this.server.listen(config.port);

  if (typeof(cb) === 'function') {
    cb(false);
  }
};

Driver.prototype.fork = function(cb) {
  var processWrangler = require('./../internal/processWrangler');
  processWrangler(config.workers, config.max_spare_procs, config.worker_respawn_delay, cb);
};

for (var k in hooks) {
  //noinspection JSUnfilteredForInLoop
  Driver[k] = hooks[k];
}

module.exports = Driver;
