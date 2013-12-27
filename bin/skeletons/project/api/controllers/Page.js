/**
 * The default controller for your home page.
 */
var turnpike = require('turnpike');
var util     = require('util');
var _        = require('underscore');

function Controller(connection) {
  turnpike.EndpointController.call(this, connection);

  this.deliver = function() {
    var view = turnpike.invokeView('Page');
    view = new view();
    view.mode('main').data({
      'body': connection.response()
    }).render(_(function(html) {
      connection.response(html).send();
    }).bind(this));
  };
}
util.inherits(Controller, turnpike.EndpointController);


Controller.prototype._GET = function(readyCallback) {
  process.nextTick(readyCallback);
};

Controller.prototype._PUT = function(readyCallback) {
  process.nextTick(readyCallback);
};

Controller.prototype._POST = function(readyCallback) {
  process.nextTick(readyCallback);
};

Controller.prototype._DELETE = function(readyCallback) {
  process.nextTick(readyCallback);
};

module.exports = Controller;
