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
var Session = require('./Session');

function EndpointController(connection) {
  var $this = this;

  this.connection = connection;
  this.view = this.name = this.constructor.name;
  this.data = {};
  this.title = '';
  this.mode = 'main';

  this.prepare = (function(readyCallback) {
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
  }).bind(this);

  this.deliver = (function() {
    var type;
    var types = [];

    for (type in $this.deliver){
      types.push(type);
    }
    console.log($this.name + ' can send types:\n' + types);

    type = connection.bestMimeType(types);

    if (type !== undefined) {
      this.deliver[type]();
    }
    else {
      $this.connection.die(406, "No acceptable return format available.");
    }
  }).bind(this);

  this.deliver['text/html'] = (function() {
    var Page = AutoLoader.invoke('Page');
    var View = AutoLoader.invokeView(this.view);

    View = new View();
    View.mode(this.mode).data(this.data).render((function(html){
        this.connection.header({'content-type' : 'text/html'}).
          response(html);
        Page = new Page(connection);
        Page.prepare(Page.deliver);
      }).bind(this));
  }).bind(this);

  this.deliver['application/json'] = (function() {
    var View = AutoLoader.invokeView('JSONout');
    View = new View();
    View.mode('main').data(this.data).render((function(output){
      this.connection.header({'content-type' : 'application/json'}).
        response(output).send();
    }).bind(this));
  }).bind(this);

  for (var k in hooks) {
    this[k] = hooks[k];
  }

}

//List items
EndpointController.prototype.index = function(readyCallback) {
  if (this.model){
    var skip = this.connection.req.query.index;
    var params = new this.model.Item();

    for (property in params) {
      if (this.connection.req.query[property]) {
        params[property] = this.connection.req.query[property];
      }
    }

    this.model.index(params, skip, (function(err, data) {
      this.data = data;
      process.nextTick(readyCallback);
    }).bind(this));
  }
  else {
    this.connection.die(405);
  }
};

//Display a single item
EndpointController.prototype.main = function(readyCallback) {
  if (this.model)  {
    var item = new this.model.Item();
    item._id = this.connection.route.params.id;
    this.model.load(item, (function(err, item){
      if (err) {
        this.connection.die(500);
      }
      else if (!item) {
        this.connection.die(404);
      }
      else {
        this.data = item;
        process.nextTick(readyCallback);
      }
    }).bind(this));
  }
  else {
    this.connection.die(405);
  }
};

//DELETE endpoint to remove an item
EndpointController.prototype.remove = function(readyCallback) {
  if (this.model){
    var item = new this.model.Item();
    item._id = this.connection.route.params.id;
    this.model.remove(item, function(err, removed) {
      this.data.removed = removed;
      process.nextTick(readyCallback);
    });
  }
  else {
    this.connection.die(405);
  }
};

//Form for confirming deletion via web interface
EndpointController.prototype.removeForm = function(readyCallback) {
  if (this.model) {
    var item = new this.model.Item();
    item._id = this.connection.route.params.id;
    this.model.load(item, (function(err, item){
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
    }).bind(this));
  }
  else {
    this.connection.die(405);
  }
};

EndpointController.prototype._GET    = function(readyCallback){this.connection.die(405, "Method GET not available for this endpoint")};
EndpointController.prototype._HEAD   = function(readyCallback){this.connection.die(405, "Method HEAD not available for this endpoint")};
EndpointController.prototype._PUT    = function(readyCallback){this.connection.die(405, "Method PUT not available for this endpoint")};
EndpointController.prototype._POST   = function(readyCallback){this.connection.die(405, "Method POST not available for this endpoint")};
EndpointController.prototype._DELETE = function(readyCallback){this.connection.die(405, "Method DELETE not available for this endpoint")};

module.exports = EndpointController;
