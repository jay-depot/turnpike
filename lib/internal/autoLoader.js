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
var models        = new ModelPool();
var views         = [];
var controllers   = [];

//The interface:
var autoLoader = {

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
