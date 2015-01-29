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
var hooks = require('hooks');
var async = require('async');
var util = require('util');

function ResourceEndpointController(connection) {
  EndpointController.call(this, connection);
}
util.inherits(ResourceEndpointController, EndpointController);


//Create an item
ResourceEndpointController.prototype.create = function(readyCallback) {
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
ResourceEndpointController.prototype.edit = function(item, readyCallback) {
  if (this.model){
    async.waterfall([
      function(next) {
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
ResourceEndpointController.prototype.index = function(readyCallback) {
  if (this.model){
    var skip = this.connection.req.query.index || 0;
    var params = {};

    for (var property in this.model.fields()) {
      if (this.connection.req.query[property]) {
        params[property] = this.connection.req.query[property];
      }
    }

    this.model.index(params, skip, function(err, data) {
      if (err) {
        this.connection.die(500);
      }
      else {
        this.data.items = data;
        process.nextTick(readyCallback);
      }
    }.bind(this));
  }
  else {
    this.connection.die(405);
  }
};

//Display a single item
ResourceEndpointController.prototype.main = function(item, readyCallback) {
  if (!item) {
    this.connection.die(404);
  }
  else {
    this.data = this.model.fields();

    for (var i in this.data) {
      this.data[i] = item[i];
    }

    process.nextTick(readyCallback);
  }
};

//Remove an item
ResourceEndpointController.prototype.remove = function(item, readyCallback) {
  if (this.model){
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

module.exports = ResourceEndpointController;
