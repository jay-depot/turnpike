/*
 * Base View. Defines the basic methods every view is expected to have so
 * we can attach hooks to them.
 */

var hooks = require('hooks');

function ViewBase() {
  this.data = function() {};
  this.mode = function() {};
  this.render = function() {};

  for (var k in hooks) {
    this[k] = hooks[k];
  }
}

module.exports = ViewBase;
