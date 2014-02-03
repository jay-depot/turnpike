var ViewBase = require('../../ViewBase');
var util     = require('util');

function JSONout() {
  var data  = {};

  ViewBase.call(this);

  this.data = function(newData) {
    data = newData;
    return this;
  };

  this.mode = function() {
    //Included only for compatibility withe the Turnpike View object spec.
    return this;
  };

  this.render = function(callback) {
    var output = JSON.stringify(data)

    process.nextTick(function() {
      callback(output);
    });

    return this;
  };

}
util.inherits(JSONout, ViewBase);

module.exports = JSONout;
