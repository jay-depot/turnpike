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

var RestEndpointController = require('./RestEndpointController');
var AutoLoader = require('./../../../internal/autoLoader');
var hooks = require('hooks');
var Session = require('./../../../server/middleware/SessionWrapper');
var async = require('async');
var util = require('util');


function WebEndpointController(connection) {
  RestEndpointController.call(this, connection);
}
util.inherits(WebEndpointController, RestEndpointController);

//Form for confirming deletion via web interface
WebEndpointController.prototype.removeForm = function(readyCallback) {
  if (this.model) {
    var item = {};
    item._id = this.connection.route.params.id;
    this.model.load(item, function(err, item){
      if (err) {
        this.connection.die(500);
      }
      else if (!item) {
        this.connection.die(404);
      }
      else {
        if (Session.csrf.state) {
          item._csrf = this.connection.req.csrfToken();
        }

        this.data = item;
        process.nextTick(readyCallback);
      }
    }.bind(this));
  }
  else {
    this.connection.die(405);
  }
};

//Form for entering new items and editing existing ones
WebEndpointController.prototype.editForm = function(readyCallback) {
  var item;

  if (this.model) {
    item = {};
    async.waterfall([
      function(next) {
        if (this.connection.route.params.id) {
          item._id = this.connection.route.params.id;
          this.model.load(item, next);
        }
        else {
          next(false, item);
        }
      }.bind(this),
      function(item, next) {
        if (this.connection.route.params.id) {
          //check if item came back empty, send a 404 if it did
          if (!item) {
            next(404);
          }
          else {
            next(false, item);
          }
        }
        else {
          next(false, item);
        }
      }.bind(this)
    ],
      function(err, item){
        var modelField;
        var bodyField;
        var fields = item;

        if (this.model.fields) {
          fields = this.model.fields();
        }

        if (err === 404) {
          this.connection.die(404);
        }
        else if (err) {
          this.connection.die(500);
        }
        else {
          if (Session.csrf.state) {
            this.data._csrf = this.connection.req.csrfToken();
          }
          for (modelField in fields) {
            if (fields.hasOwnProperty(modelField)) {
              bodyField = this.fieldMapper(modelField);
              this.data[bodyField] = item[modelField];
            }
          }

          process.nextTick(readyCallback);
        }
      }.bind(this));
  }
  else {
    this.connection.die(405);
  }
};

module.exports = WebEndpointController;
