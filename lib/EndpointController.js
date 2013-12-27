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

var AutoLoader = require('./AutoLoader');

function EndpointController(connection) {
  this.connection = connection;

  this.prepare = function(readyCallback) {
    switch (connection.method) {
      case "GET":
        this._GET(readyCallback);
        break;
      case "PUT":
        this._PUT(readyCallback);
        break;
      case "POST":
        this._POST(readyCallback);
        break;
      case "DELETE":
        this._DELETE(readyCallback);
        break;
    }
  };

  this.deliver = function() {
    var Page = AutoLoader.invoke('Page');
    Page = new Page(connection);
    Page.prepare(Page.deliver);
  };
}

EndpointController.prototype._GET    = function(readyCallback){throw new Error("Called abstract method")};
EndpointController.prototype._PUT    = function(readyCallback){throw new Error("Called abstract method")};
EndpointController.prototype._POST   = function(readyCallback){throw new Error("Called abstract method")};
EndpointController.prototype._DELETE = function(readyCallback){throw new Error("Called abstract method")};

module.exports = EndpointController;
