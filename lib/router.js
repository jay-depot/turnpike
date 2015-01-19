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
  //check for a routes.json file
  try {
    //if there is one, display a deprecation warning

    //load the routes.json file and add the routes to express

  }
  catch (e) {
    // File doesn't exist? No problem!
  }
};

module.exports = router;
