/**
 * Test the Router class.
 */

var Router = require('../lib/Router');

exports['test create new router from object'] = function(assert) {
  Router.routes({"/test":"Test"});
};

exports['test root route resolves properly'] = function(assert) {
  Router.routes({});
  var route = Router.resolve('/');
  assert.equal(route.controller, "Index", "'/' should resolve to 'Index'");
};

exports['test url not in table resolves to 404'] = function(assert) {
  Router.routes({});
  var route = Router.resolve('/obviously-does-not-exist');
  assert.equal(route.controller, false, "Resolving a nonexistent route gives back false");
};

exports['test static routes resolve properly'] = function(assert) {
  Router.routes({"/test" : "Test", "/example/subpath" : "Example"});
  var route = Router.resolve("/test");
  assert.equal(route.controller, "Test", "Static single-part route returns correct controller name");
  route = Router.resolve('/test/passes');
  assert.equal(route.controller, false, "Subpath of existing static route returns false");
  route = Router.resolve("/example/subpath");
  assert.equal(route.controller, "Example", "Static two-part route returns correct controller name");
  route = Router.resolve('/example/this-is-not-one');
  assert.equal(route.controller, false, "Partial match on static two-part route returns false");
};

exports['test routes with one variable resolve properly'] = function(assert) {
  Router.routes({"/test/:var1" : "Test"});
  var route = Router.resolve("/test");
  assert.equal(route.controller, false, "Route with variable does not match path without one");
  route = Router.resolve("/test/passes/with-flying-colors");
  assert.equal(route.controller, false, "Route with one variable does not match path with extra variables");
  route = Router.resolve("/test/passes");
  assert.equal(route.controller, "Test", "Controller name is returned correctly from route with variable");
  assert.equal(route.params.var1, "passes", "Variable given in path is returned correctly in route");
};
