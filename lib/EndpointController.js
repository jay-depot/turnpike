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
var hooks = require('hooks');

function EndpointController(connection) {
  var $this = this;
  this.connection = connection;
  this.view = this.name = this.constructor.name;
  this.data = {};
  this.title = '';


  this.prepare = function(readyCallback) {
    switch (connection.method) {
      case "GET":
        this._GET(readyCallback);
        break;
      case "HEAD":
        this._HEAD(readyCallback);
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
    var type
      , types = [];
    for (type in $this.deliver){
      types.push(type);
    }
    console.log($this.name + ' can send types:\n' + types);

    type = connection.bestMimeType(types);

    if (typeof($this.deliver[type] === 'function')) {
      $this.deliver[type]();
    }
    else {
      $this.connection.die(406, "No acceptable return format available.");
    }
  };

  this.deliver['text/html'] = function() {
    var Page = AutoLoader.invoke('Page');
    var View = AutoLoader.invokeView($this.view);

    View = new View();
    View.mode('main').data($this.data).render(function(html){
      $this.connection.header({'content-type' : 'text/html'}).
        response(html);
      Page = new Page(connection);
      Page.prepare(Page.deliver);
    });
  };

  this.deliver['application/json'] = function() {
    var View = AutoLoader.invokeView('JSONout');
    View = new View();
    View.mode('main').data($this.data).render(function(output){
      $this.connection.header({'content-type' : 'application/json'}).
        response(output).send();
    });
  };

  for (var k in hooks) {
    this[k] = hooks[k];
  }

}

EndpointController.prototype._GET    = function(readyCallback){this.connection.die(405, "Method GET not available for this endpoint")};
EndpointController.prototype._HEAD   = function(readyCallback){this.connection.die(405, "Method HEAD not available for this endpoint")};
EndpointController.prototype._PUT    = function(readyCallback){this.connection.die(405, "Method PUT not available for this endpoint")};
EndpointController.prototype._POST   = function(readyCallback){this.connection.die(405, "Method POST not available for this endpoint")};
EndpointController.prototype._DELETE = function(readyCallback){this.connection.die(405, "Method DELETE not available for this endpoint")};

module.exports = EndpointController;
