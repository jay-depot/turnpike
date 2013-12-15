/**
 * Magical pixie dust for finding Models, Views and Controllers and making
 * them available to the Turnpike.invoke() family of methods without the
 * caller needing to know exact file locations.
 *
 * AutoLoader picks up all the default models, views and controllers from the
 * framework first. External, NPM-installed packages can then register a
 * Turnpike callback to get their stuff added, which may override Turnpike
 * core. Finally, Autoload then scans the app itself for its models, views and
 * controllers. Again, anything from Core, as well as externally packaged
 * overrides, can be overridden here.
 */

var _           = require('underscore');
var models      = new Array();
var views       = new Array();
var controllers = new Array();

//The interface:
var AutoLoader = {
  invoke: function(name) {
    return AutoLoader.invokeController(name) || AutoLoader.invokeView(name);
  },

  invokeController: function(name) {
    return _(controllers).findWhere({'name':name}).construct;
  },

  invokeView: function(name) {
    //TODO: We need to write a master wrapping controller that can execute any dangling view.
    return _(views).findWhere({'name':name});
  },

  invokeModel: function(name) {
    return _(models).findWhere({'name':name}).construct;
  },

  // Exports a copy of the full list of controllers and views detected.
  list: function() {
    return _.union(_(views).pluck('name'), _(controllers).pluck('name'));
  }

  //TODO: Add methods for external modules to register items with the AutoLoader.
};

module.exports = AutoLoader;

//The setup:
(_.once(function(){
  var path    = require('path');
  var fs      = require('fs-extra');
  var libdir  = path.dirname(module.filename);
  var cwd = process.cwd();
  var dir;
  var pattern = /^\w*\.js$/;

  //Start with views (why not).
  dir = path.join(libdir, 'api', 'views');
  _(fs.readdirSync(dir)).each(function(name) {
    //TODO: Implement the view constructor so we can call it here
    console.log(name);
  });

  dir = path.join(cwd, 'api', 'views');
  _(fs.readdirSync(dir)).each(function(name) {
    //TODO: Implement the view constructor so we can call it here too
    console.log(name);
  });

  //Controllers
  dir = path.join(libdir, 'api', 'controllers');
  _(fs.readdirSync(dir)).each(function(name) {
    if (pattern.test(name)) {
      controllers.unshift({
        'name':      name.replace(/\.js/, ''),
        'construct': require(path.join(dir, name))
      });
    }
  });

  dir = path.join(cwd, 'api', 'controllers');
  _(fs.readdirSync(dir)).each(function(name) {
    if (pattern.test(name)) {
      controllers.unshift({
        'name':      name.replace(/\.js/, ''),
        'construct': require(path.join(dir, name))
      });
    }
  });
}))();
