/**
 * The Turnpike router.
 */
var Routes = require('routes');

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

Router.resolve = function(path) {
  var route = {}, resolve = Router.router.match(path);
  if (resolve) {
    route.params     = resolve.params;
    route.route      = resolve.route;
    route.controller = resolve.fn;
  }
  else {
    route.controller = false;
  }
  return route;
};

module.exports.routes = Router.routes;
module.exports.resolve = Router.resolve;
