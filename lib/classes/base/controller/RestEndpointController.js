/**
 * Turnpike porcelain.
 *
 * This constructor contains all of the invariants expected of a controller for a REST endpoint.
 *
 * Turnpike's "Endpoint" controller system assumes a few things about your app.
 * 1. You want to be REST based.
 * 2. All URLs are of the form [controller]/[itemId]
 * 3. EVERYTHING gets a REST endpoint. Even controllers only intended to provide small widgets
 *    that don't need to be stand-alone pages.
 *
 * @constructor
 */

var EndpointController = require('./EndpointController');
var AutoLoader = require('./../../../internal/autoLoader');
var hooks = require('hooks');
var Session = require('./../../../server/middleware/SessionWrapper');
var async = require('async');
var util = require('util');

function RestEndpointController(connection) {
  EndpointController.call(this, connection);
}
util.inherits(RestEndpointController, EndpointController);


//Create an item
RestEndpointController.prototype.create = function(readyCallback) {
  if (this.model) {
    async.waterfall([
      function(next) {
        this.model.create(next);
      }.bind(this),
      function(item, next) {
        var modelField;
        var bodyField;
        var fields = this.model.fields();

        for (modelField in fields) {
          bodyField = this.fieldMapper(modelField, true);
          if (this.connection.req.body.hasOwnProperty(bodyField)) {
            item[modelField] = this.connection.req.body[bodyField];
          }
        }

        this.model.save(item, next);
      }.bind(this)
    ], function(err, res) {
      if (err) {
        console.dir(err);
        console.dir(err.stack);
        this.connection.die(500);
      }
      else {
        this.data = res;
        readyCallback();
      }
    }.bind(this));
  }
  else {
    this.connection.die(405);
  }
};


//Edit an existing item
RestEndpointController.prototype.edit = function(id, readyCallback) {
  if (this.model){
    async.waterfall([
      function(next) {
        var item = {};
        item._id = id;
        this.model.load(item, next);
      }.bind(this),
      function(item, next) {
        var modelField;
        var bodyField;
        var fields = this.model.fields();

        if (item) {
          for (modelField in fields) {
            bodyField = this.fieldMapper(modelField, true);
            if (this.connection.req.body.hasOwnProperty(bodyField)) {
              item[modelField] = this.connection.req.body[bodyField];
            }
          }
          this.model.save(item, next);
        }
        else {
          next(404);
        }
      }.bind(this)
    ], function(err, res) {
      if (err === 404) {
        this.connection.die(404);
      }
      else if (err) {
        this.connection.die(500);
      }
      else {
        this.data = res;
        readyCallback();
      }
    }.bind(this));
  }
  else {
    this.connection.die(405);
  }
};

//List items
RestEndpointController.prototype.index = function(readyCallback) {
  if (this.model){
    var skip = this.connection.req.query.index || 0;
    var params = {};

    for (var property in this.model.fields()) {
      if (this.connection.req.query[property]) {
        params[property] = this.connection.req.query[property];
      }
    }

    this.model.index(params, skip, function(err, data) {
      var i, j;
      var buffer = [];

      if (err) {
        this.connection.die(500);
      }
      else {
        for (i = 0; i < data.length; i++) {
          for (j in data[i]) {
            //noinspection JSUnfilteredForInLoop
            buffer[i][j] = data[i][j];
          }
        }

        this.data.items = buffer;
        process.nextTick(readyCallback);
      }
    }.bind(this));
  }
  else {
    this.connection.die(405);
  }
};

//Display a single item
RestEndpointController.prototype.main = function(id, readyCallback) {
  console.log(id);
  if (this.model)  {
    var item = {};
    item._id = id;
    this.model.load(item, function(err, item){
      if (err) {
        this.connection.die(500);
      }
      else if (!item) {
        this.connection.die(404);
      }
      else {
        this.data = this.model.fields();

        for (var i in this.data) {
          this.data[i] = item[i];
        }

        process.nextTick(readyCallback);
      }
    }.bind(this));
  }
  else {
    this.connection.die(405);
  }
};

//Remove an item
RestEndpointController.prototype.remove = function(id, readyCallback) {
  if (this.model){
    var item = {};
    item._id = id;
    this.model.remove(item, function(err, removed) {
      if (err) {
        this.connection.die(500);
      }
      else if (removed.length === 0) {
        this.connection.die(404);
      }
      else {
        this.data.removed = removed;
        process.nextTick(readyCallback);
      }
    }.bind(this));
  }
  else {
    this.connection.die(405);
  }
};

module.exports = RestEndpointController;
