var EndpointController = require('./EndpointController');
var hooks = require('hooks');
var async = require('async');
var util = require('util');

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
function RestEndpointController(connection) {
  EndpointController.call(this, connection);
}
EndpointController.extend(RestEndpointController);


/**
 * Controller action to create a new item.
 *
 * Corresponds with the HTTP POST method.
 */
RestEndpointController.prototype.create = function(params, readyCallback) {
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


/**
 * Controller action to edit an existing item.
 *
 * Officially, this is used to handle HTTP PUT requests.
 * Semantically, this is currently handled more like an HTTP PATCH request.
 */
RestEndpointController.prototype.edit = function(params, readyCallback) {
  if (this.model){
    async.waterfall([
      function(next) {
        var item = {};
        item._id = params.id;
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

/**
 * Controller action to get a list of items.
 *
 * Corresponds to the HTTP GET method on an index endpoint.
 */
RestEndpointController.prototype.index = function(params, readyCallback) {
  if (this.model){
    var skip = this.connection.req.query.index || 0;
    var search = {};

    for (var property in this.model.fields()) {
      if (this.connection.req.query[property]) {
        search[property] = this.connection.req.query[property];
      }
    }

    this.model.index(search, skip, function(err, data) {
      var i, j;
      var buffer = [];

      if (err) {
        this.connection.die(500);
      }
      else {
        for (i = 0; i < data.length; i++) {
          //noinspection JSUnfilteredForInLoop
          buffer[i] = {};
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

/**
 * Controller action to display a single item.
 *
 * Corresponds to the HTTP GET method on a single data item's endpoint
 */
RestEndpointController.prototype.main = function(params, readyCallback) {
  if (this.model)  {
    var item = {};
    item._id = params.id;
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

/**
 * Controller action to delete an item.
 *
 * Corresponds with the HTTP DELETE method.
 */
RestEndpointController.prototype.remove = function(params, readyCallback) {
  if (this.model){
    var item = {};
    item._id = params.id;
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
