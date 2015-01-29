/**
 * Provides route declaration interface. Internally, this is just a facade over Express routing.
 * @namespace turnpike.router
 */
var router = {};
var driver = require('./server/drive').driver;

function connectionHandler(handler) {
  return function(req, res, next) {
    var Connection = require('./classes/Connection');
    var connection = new Connection(req, res, next);

    handler(connection);
  }
}

/**
 * @param {String} pathname
 * @constructor
 */
function Path(pathname) {
  this.route = driver.app.route(pathname);
}

Path.prototype.get = function(handler) {
  this.route.get(connectionHandler(handler));
  return this;
};

Path.prototype.put = function(handler) {
  this.route.put(connectionHandler(handler));
  return this;
};

Path.prototype.post = function(handler) {
  this.route.post(connectionHandler(handler));
  return this;
};

Path.prototype['delete'] = function(handler) {
  this.route['delete'](connectionHandler(handler));
  return this;
};

Path.prototype.head = function(handler) {
  this.route.head(connectionHandler(handler));
  return this;
};

Path.prototype.options = function(handler) {
  this.route.options(connectionHandler(handler));
  return this;
};

/**
 * Add a path to the routing table.
 *
 * @param {String} pathname
 * @returns {Path}
 */
router.path = function(pathname) {
  return new Path(pathname);
};

/**
 * Loads legacy routes.json info and adds it to the routing table
 */
router.legacy = function() {
  var action = require('./action');
  var fs = require('fs-extra');
  var name, path, route, routes, verb, expressVerb;

  //check for a routes.json file
  try {
    routes = fs.readJSONSync('./routes.json');
    console.warn('routes.json is DEPRECATED!');
    for (name in routes) if (routes.hasOwnProperty(name)){
      route = routes[name];

      if (typeof route === 'string') {
        router.path(name)
          .get(action.accessChecked(route))
          .put(action.accessChecked(route))
          .post(action.accessChecked(route))
          ['delete'](action.accessChecked(route));
      }
      else {
        path = router.path(name);
        for (verb in route) if (route.hasOwnProperty(verb)) {
          if (verb === 'DEL') expressVerb = 'delete';
          else expressVerb = verb.toLowerCase();

          path[expressVerb](action.accessChecked(route[verb]));
        }
      }
    }
    router.path('/')
      .get(action.accessChecked('Index'));
  }
  catch (e) {
    // File doesn't exist? No problem!
  }
};

module.exports = router;
