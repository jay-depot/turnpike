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
  assert.equal(route.controller, "Index", "Expected: 'Index'");
};

exports['test url not in table resolves to 404'] = function(assert) {
  Router.routes({});
  var route = Router.resolve('/obviously-does-not-exist');
  assert.equal(route.controller, false, "Expected: false");
};

exports['test static routes resolve properly'] = function(assert) {
  Router.routes({"/test" : "Test", "/example/subpath" : "Example"});
  var route = Router.resolve("/test");
  assert.equal(route.controller, "Test", "Expected: 'Test'");
  route = Router.resolve('/test/passes');
  assert.equal(route.controller, false, "Expected: false");
  route = Router.resolve("/example/subpath");
  assert.equal(route.controller, "Example", "Expected: 'Example'");
  route = Router.resolve('/example/this-is-not-one');
  assert.equal(route.controller, false, "Expected: false");
};

exports['test routes with one variable resolve properly'] = function(assert) {
  Router.routes({"/test/:var1" : "Test"});
  var route = Router.resolve("/test");
  assert.equal(route.controller, false, "Expected: false");
  route = Router.resolve("/test/passes/with-flying-colors");
  assert.equal(route.controller, false, "Expected: false");
  route = Router.resolve("/test/passes");
  assert.equal(route.controller, "Test", "Expected: 'Test'");
  assert.equal(route.params.var1, "passes", "Expected: var1 == 'passes'");
  route = Router.resolve("/test/passes/with-flying-colors");
  assert.equal(route.controller, false, "Expected: false");
};
