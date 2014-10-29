/**
 * The Turnpike router.
 */
var Routes = require('routes');
var hooks = require('hooks');

Router = {};

Router.routes = function(routes) {
  delete Router.router;
  Router.router = Routes();

  Router.router.addRoute('/', "Index");

  for (var route in routes) {
    if (routes.hasOwnProperty(route)) {
      Router.router.addRoute(route, routes[route]);
    }
  }
};

Router.resolve = function(callback, path) {
  var route = {}, resolve = Router.router.match(path);

  if (resolve) {
    route.params     = resolve.params;
    route.route      = resolve.route;
    route.controller = resolve.fn;
    callback(false, route);
  }
  else {
    route.controller = false;
    callback(new Error("404"), route);
  }
};

for (var k in hooks) {
  Router[k] = hooks[k];
}

Router.hook('resolve', Router.resolve);

module.exports = Router;
