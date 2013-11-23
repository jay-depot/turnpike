/**
 * Turnpike porcelain.
 *
 * This constructor contains all of the invariants expected of a controller for a REST endpoint.
 *
 * Turnpike's "Endpoint" controller system assumes a few things about your app.
 * 1. You want to be REST based.
 * 2. All URLs are of the form [controller]/[itemId]
 *
 * @constructor
 */

function EndpointController(connection) {
  var _headers = {'Content-Type': 'text/plain'}
    , _status = 0;

  this.setStatus  = function(status) { _status = status; };

  this.setBody    = function(body) { connection._body = body; };

  this.getHeaders = function() { return _headers };

  this.prepare = function(readyCallback) {
      switch (connection.req.method) {
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
    connection.res.writeHead(_status, _headers);
    connection.res.end(_body);
  };
}

EndpointController.prototype._GET    = function(readyCallback){throw new Error("Called abstract method")};
EndpointController.prototype._PUT    = function(readyCallback){throw new Error("Called abstract method")};
EndpointController.prototype._POST   = function(readyCallback){throw new Error("Called abstract method")};
EndpointController.prototype._DELETE = function(readyCallback){throw new Error("Called abstract method")};

module.exports = EndpointController;
