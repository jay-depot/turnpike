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
  $this = this;
  this.connection = connection;
  this.name = this.constructor.name;
  this.data = {};
  this.title = '';

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
    var type
      , types = [];
    for (type in $this.deliver){
      types.push(type);
    }
    console.log($this.name + ' can send types:\n' + types);

    type = connection.bestMimeType(types);

    $this.deliver[type]();
  };

  this.deliver['text/html'] = function() {
    var Page = AutoLoader.invoke('Page');
    var View = AutoLoader.invokeView($this.name);

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

EndpointController.prototype._GET    = function(readyCallback){throw new Error("Called abstract method")};
EndpointController.prototype._PUT    = function(readyCallback){throw new Error("Called abstract method")};
EndpointController.prototype._POST   = function(readyCallback){throw new Error("Called abstract method")};
EndpointController.prototype._DELETE = function(readyCallback){throw new Error("Called abstract method")};

module.exports = EndpointController;
