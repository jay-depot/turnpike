var _ = require("underscore");

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
function EndpointController(req, res, body, path) {
  var $this = this;
  this._req = req;
  this._res = res;
  this._body = body;
  this._path = path;
  this._headers = {'Content-Type': 'text/plain'};
  this._status = 0;

  this.protected = {
    _GET:    function(readyCallback){throw new Error("Called abstract method")},
    _PUT:    function(readyCallback){throw new Error("Called abstract method")},
    _POST:   function(readyCallback){throw new Error("Called abstract method")},
    _DELETE: function(readyCallback){throw new Error("Called abstract method")}
  };

  this.public = {
    setStatus:  function(status) { $this.private._status = status; },
    setBody:    function(body) { $this.private._body = body; },
    getHeaders: function() { return $this._headers },

    prepare:    function(readyCallback) {
      switch ($this._req.method) {
        case "GET":
          $this.protected._GET(readyCallback);
          break;
        case "PUT":
          $this.protected._PUT(readyCallback);
          break;
        case "POST":
          $this.protected._POST(readyCallback);
          break;
        case "DELETE":
          $this.protected._DELETE(readyCallback);
          break;
      }
    },

    deliver:   function() {
      $this.private._res.writeHead($this.private._status, $this._headers);
      $this.private._res.end($this.private._body);
    }
  };

  return this.public;
}

EndpointController.extend = function(that) {
  var controller = new EndpointController(that._req, that._res, that._body, that._path);
  _.extend(that, controller);
};

module.exports = EndpointController;
