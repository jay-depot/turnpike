/**
 * Test the Router class.
 */

var Router = require('../lib/server/Router');

exports['test create new router from object'] = function(assert) {
  Router.routes({'/test':'Test'});
};

exports['test root route resolves properly'] = function(assert, done) {
  Router.routes({});
  Router.resolve(function(err, route) {
    assert.equal(route.controller, 'Index', '"/" should resolve to "Index"');
    done();
  }, '/');
};

exports['test url not in table resolves to 404'] = function(assert, done) {
  Router.routes({});
  Router.resolve(function(err, route) {
    assert.equal(route.controller, false, "Resolving a nonexistent route gives back false");
    done();
  }, '/obviously-does-not-exist');
};

exports['test static routes resolve properly'] = function(assert, done) {
  Router.routes({'/test' : 'Test', '/example/subpath' : 'Example'});
  Router.resolve(function(err, route) {
    assert.equal(route.controller, "Test", "Static single-part route returns correct controller name");
    Router.resolve(function(err, route) {
      assert.equal(route.controller, false, "Subpath of existing static route returns false");
      Router.resolve(function(err, route) {
        assert.equal(route.controller, "Example", "Static two-part route returns correct controller name");
        Router.resolve(function(err, route) {
          assert.equal(route.controller, false, "Partial match on static two-part route returns false");
          done();
        }, '/example/this-is-not-one');
      }, '/example/subpath');
    }, '/test/passes');
  }, '/test');
};

exports['test routes with one variable resolve properly'] = function(assert, done) {
  Router.routes({"/test/:var1" : "Test"});
  Router.resolve(function(err, route){
    assert.equal(route.controller, false, "Route with variable does not match path without one");
    Router.resolve(function(err, route){
      assert.equal(route.controller, false, "Route with one variable does not match path with extra variables");
      Router.resolve(function(err, route){
        assert.equal(route.controller, "Test", "Controller name is returned correctly from route with variable");
        assert.equal(route.params.var1, "passes", "Variable given in path is returned correctly in route");
        done();
      }, '/test/passes');
    }, '/test/passes/with-flying-colors');
  }, '/test');
};

exports['test pre/post hooks fire'] = function(assert, done) {
  var pre   = false
    , post  = false
    , route;

  Router.routes({});
  Router.pre('resolve', function(next, path) {
    pre = true;
    next(path);
  });
  Router.post('resolve', function(next, path) {
    post = true;
    next(path);
  });
  Router.resolve(function(err, route){
    assert.ok(pre,  "pre-hook fires");
    process.nextTick( function() {
      assert.ok(post, "post-hook fires");
      done();
    });
  }, '/');
};
