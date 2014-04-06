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

var _             = require('underscore');
var ViewBuilder   = require('./ViewBuilder');
var ModelPool     = require('./ModelPool');
var AccessControl = require('./AccessControl');
var models        = new ModelPool();
var views         = new Array();
var controllers   = new Array();
var access        = new AccessControl.AccessControl();

//The interface:
var AutoLoader = {
  accessControl: access,

  invoke: function(name) {
    //TODO: We need to write a master wrapping controller that can execute any dangling view.
    return AutoLoader.invokeController(name) || AutoLoader.invokeView(name);
  },

  invokeController: function(name) {
    var controller = _(controllers).findWhere({'name':name})
    if (typeof(controller) === "object") {
      return controller.construct;
    }
    else {
      return false;
    }
  },

  invokeView: function(name) {
    var view = _(views).findWhere({'name':name});
    if (typeof(view) === "object") {
      return view.construct;
    }
    else {
      return false;
    }
  },

  invokeModel: function(name) {
    return models.retrieve(name);
  },

  // Exports a copy of the full list of controllers and views detected.
  list: function() {
    return _.union(_(views).pluck('name'), _(controllers).pluck('name'));
  },

  scandir: function(newdir) {
    //TODO: We should really accept a priority parameter here.
    var path    = require('path');
    var fs      = require('fs-extra');
    var dir;
    var pattern = /^\w*\.js$/;

    //Start with views (why not).
    try {
      dir = path.join(newdir, 'api', 'views');
      _(fs.readdirSync(dir)).each(function(name) {
        var view;
        var item = path.join(dir, name);
        if (fs.statSync(item).isDirectory()) {
          view = ViewBuilder(item);
        }
        else {
          name = name.replace('.js', "");
          view = require(item);
        }

        views.unshift({
          'name':      name,
          'construct': view
        });
      });
    }
    catch (err) {
      console.warn('AutoLoader WARN: ' + dir + ' does not exist');
    }

    //Controllers
    try {
      dir = path.join(newdir, 'api', 'controllers');
      _(fs.readdirSync(dir)).each(function(name) {
        if (pattern.test(name)) {
          controllers.unshift({
            'name':      name.replace(/\.js/, ''),
            'construct': require(path.join(dir, name))
          });
        }
      });
    }
    catch (err) {
      console.warn('AutoLoader WARN: ' + dir + ' does not exist');
    }

    //Access rules
    try {
      dir = path.join(newdir, 'api', 'access');
      _(fs.readdirSync(dir)).each(function(name) {
        if (pattern.test(name)) {
          access.addRules(name.replace(/\.js/, ''),
            require(path.join(dir, name))
          );
        }
      });
    }
    catch (err) {
      console.warn('AutoLoader WARN: ' + dir + ' does not exist');
    }

    //Models
    try {
      dir = path.join(newdir, 'api', 'models');
      _(fs.readdirSync(dir)).each(function(name) {
        if (pattern.test(name)) {
          var model;
          var item = path.join(dir, name);

          name = name.replace('.js', "");
          model = require(item);

          models.register(name, model);
        }
      });
    }
    catch (err) {
      console.warn('AutoLoader WARN: ' + dir + ' does not exist');
    }
  }
};

module.exports = AutoLoader;
