/**
 * ViewBuilder.
 *
 * Autogenerates a view class on the fly from a collection of Jade templates.
 *
 * Basic concept:
 * ViewBuilder takes a directory path and scans it for template files. Each is
 * assumed to be a display mode for a single view. Every template in a view
 * should take subsets of the same set of variables.
 * At minimum, every view should have a "main" mode. This is the default if
 * nothing else is chosen, and is what is used when that view is meant to be
 * the "main" content on the page.
 */

var _        = require('underscore');
var fs       = require('fs-extra');
var jade     = require('jade');
var path     = require('path');
var util     = require('util');
var ViewBase = require('./ViewBase');

function ViewBuilder(files) {
  //list contents of path, and for each .jade file add an available mode.
  var modes = {};
  var i;

  for (i in files) {
    modes[path.basename(files[i], '.jade')] = files[i];
  }

  var view = function() {
    var data  = {};
    var mode;


    this.data = function(newData) {
      data = newData;

      return this;
    }

    this.mode = function(newMode) {
      if (modes.hasOwnProperty(newMode)) {
        mode = modes[newMode];
      }
      return this;
    }

    this.render = function(callback) {
      //we don't pre-load jade templates, so since they need to be async loaded, this method takes a callback.
      jade.renderFile(mode, data, function(err, html) {
        if (err) {
          throw err;
        }

        callback(html);
      });

      return this;
    }

    ViewBase.call(this);
  };
  util.inherits(view, ViewBase);

  return view;
}

module.exports = ViewBuilder;
