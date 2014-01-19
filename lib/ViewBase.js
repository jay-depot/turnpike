/*
 * Base View. Defines the basic methods every view is expected to have so
 * we can attach hooks to them.
 */

var hooks = require('hooks');

function ViewBase() {
  this.data = this.data || function() { return this; };
  this.mode = this.mode || function() { return this; };
  this.render = this.render || function(cb) {process.nextTick(function(){cb('');return this;})};

  for (var k in hooks) {
    this[k] = hooks[k];
  }
}

module.exports = ViewBase;
