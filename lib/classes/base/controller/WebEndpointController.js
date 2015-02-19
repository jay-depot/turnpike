var RestEndpointController = require('./RestEndpointController');
var SessionWrapper = require('./../../../server/middleware/SessionWrapper');
var async = require('async');
var util = require('util');

/**
 * This constructor contains all of the invariants expected of a controller for a Web endpoint.
 *
 * @constructor
 */
function WebEndpointController(connection) {
  RestEndpointController.call(this, connection);
}
RestEndpointController.extend(WebEndpointController);

/**
 * Controller action to serve the form for confirming item deletion via a web interface
 */
WebEndpointController.prototype.removeForm = function(params, readyCallback) {
  if (this.model) {
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
        if (SessionWrapper.csrf.state) {
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

/**
 * Controller action to serve the form for entering new items and editing existing ones
 */
WebEndpointController.prototype.editForm = function(params, readyCallback) {
  var item;

  if (this.model) {
    item = {};
    async.waterfall([
      function(next) {
        if (params.id) {
          item._id = params.id;
          this.model.load(item, next);
        }
        else {
          next(false, item);
        }
      }.bind(this),
      function(item, next) {
        if (params.id) {
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
          if (SessionWrapper.csrf.state) {
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
