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
var async = require('async');

function EndpointController(connection) {
  var $this = this;

  this.connection = connection;
  this.view = this.name = this.constructor.name;
  this.data = {};
  this.title = '';
  this.mode = 'main';

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
  }.bind(this);

  this.deliver = function() {
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
  }.bind(this);

  this.deliver['text/html'] = function() {
    var Page = AutoLoader.invoke('Page');
    var View = AutoLoader.invokeView(this.view);

    View = new View();
    View.mode(this.mode).data(this.data).render(function(html){
        this.connection.header({'content-type' : 'text/html'}).
          response(html);
        Page = new Page(connection);
        Page.prepare(Page.deliver);
      }.bind(this));
  }.bind(this);

  this.deliver['application/json'] = function() {
    var View = AutoLoader.invokeView('JSONout');
    View = new View();
    View.mode('main').data(this.data).render(function(output){
      this.connection.header({'content-type' : 'application/json'}).
        response(output).send();
    }.bind(this));
  }.bind(this);

  for (var k in hooks) {
    this[k] = hooks[k];
  }

}


//Default field mapper. It does nothing.
EndpointController.prototype.fieldMapper = function(field) {
  return field;
};

//Create an item
EndpointController.prototype.create = function(readyCallback) {
  if (this.model) {
    async.waterfall([
      function(next) {
        this.model.create(next);
      }.bind(this),
      function(item, next) {
        var modelField;
        var bodyField;
        var fields = this.model.fields();

        console.log(item);
        console.log(fields);
        for (modelField in fields) {
          bodyField = this.fieldMapper(modelField, true);
          if (this.connection.req.body.hasOwnProperty(bodyField)) {
            item[modelField] = this.connection.req.body[bodyField];
          }
        }

        console.log(item);
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


//Edit an existing item
EndpointController.prototype.edit = function(readyCallback) {
  if (this.model){
    async.waterfall([
      function(next) {
        var item = new this.model.Item();
        item._id = this.connection.route.params.id;
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

//List items
EndpointController.prototype.index = function(readyCallback) {
  if (this.model){
    var skip = this.connection.req.query.index || 0;
    var params = {};

    if (params._id) delete params._id;
    for (property in this.model.fields()) {
      if (this.connection.req.query[property]) {
        params[property] = this.connection.req.query[property];
      }
    }

    this.model.index(params, skip, function(err, data) {
      if (err) {
        this.connection.die(500);
      }
      else {
        this.data.items = data;
        process.nextTick(readyCallback);
      }
    }.bind(this));
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
    this.model.load(item, function(err, item){
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
    }.bind(this));
  }
  else {
    this.connection.die(405);
  }
};

//Remove an item
EndpointController.prototype.remove = function(readyCallback) {
  if (this.model){
    var item = new this.model.Item();
    item._id = this.connection.route.params.id;
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

//Form for confirming deletion via web interface
EndpointController.prototype.removeForm = function(readyCallback) {
  if (this.model) {
    var item = new this.model.Item();
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
EndpointController.prototype.editForm = function(readyCallback) {
  var item;

  if (this.model) {
    item = new this.model.Item();
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

EndpointController.prototype._GET    = function(readyCallback){this.connection.die(405, "Method GET not available for this endpoint")};
EndpointController.prototype._HEAD   = function(readyCallback){this.connection.die(405, "Method HEAD not available for this endpoint")};
EndpointController.prototype._PUT    = function(readyCallback){this.connection.die(405, "Method PUT not available for this endpoint")};
EndpointController.prototype._POST   = function(readyCallback){this.connection.die(405, "Method POST not available for this endpoint")};
EndpointController.prototype._DELETE = function(readyCallback){this.connection.die(405, "Method DELETE not available for this endpoint")};

module.exports = EndpointController;
