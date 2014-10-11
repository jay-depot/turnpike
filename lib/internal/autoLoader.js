/**
 * Node Auto-loader.
 *
 * Recursively scans a directory and converts it into a nested javascript
 * object. Files ending in .js are require()'d into the appropriate place
 * in the resulting object.
 */

var _             = require('underscore');
var ViewBuilder   = require('./../classes/base/view/ViewBuilder');
var ModelPool     = require('./ModelPool');
var AccessControl = require('./../server/AccessControl');
var models        = new ModelPool();
var views         = [];
var controllers   = [];
var access        = new AccessControl.AccessControl();

//The interface:
var autoLoader = {
  accessControl: access,

  invoke: function(name) {
    //TODO: We need to write a master wrapping controller that can execute any dangling view.
    return autoLoader.invokeController(name) || autoLoader.invokeView(name);
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
      dir = path.join(newdir, 'application', 'views');
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
      console.warn('autoLoader WARN: ' + dir + ' does not exist');
    }

    //Controllers
    try {
      dir = path.join(newdir, 'application', 'controllers');
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
      console.warn('autoLoader WARN: ' + dir + ' does not exist');
    }

    //Access rules
    try {
      dir = path.join(newdir, 'application', 'access');
      _(fs.readdirSync(dir)).each(function(name) {
        if (pattern.test(name)) {
          access.addRules(name.replace(/\.js/, ''),
            require(path.join(dir, name))
          );
        }
      });
    }
    catch (err) {
      console.warn('autoLoader WARN: ' + dir + ' does not exist');
    }

    //Models
    try {
      dir = path.join(newdir, 'application', 'collections');
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
      console.warn('autoLoader WARN: ' + dir + ' does not exist');
    }
  },

  load: function(pathName) {
    var fs = require('fs-extra');
    var path = require('path');
    var output = {};
    var stat = fs.statSync(pathName);
    var pattern = /^\w*\.js$/;
    //console.log('autoloader: Examining', pathName);

    if (stat.isDirectory()) {
      _(fs.readdirSync(pathName)).each(function(file) {
        //console.log('autoloader: Scanning Directory', path.join(pathName, file));
        output[file.replace('.js', '')] = autoLoader.load(path.join(pathName, file));
      });
    }
    else if(pattern.test(path.basename(pathName))) {
      //console.log('autoloader: Parsing', pathName);
      pathName = pathName.replace(pattern, '');
      output = require(pathName);
    }
    else {
      //console.log('autoloader: Listing', pathName);
      output = pathName;
    }

    return output;
  }
};

module.exports = autoLoader;
