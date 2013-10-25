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

  EndpointController.extend = function(req, res, body, path) {
    var controller = new EndpointController(req, res, body, path);
    return {
      protected: controller.protected,
      public: controller.public
    };
  };

  return this.public;
}

module.exports = EndpointController;
