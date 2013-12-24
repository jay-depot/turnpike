/**
 * The default controller for your home page.
 */
var turnpike = require('turnpike');
var util     = require('util');
var _        = require('underscore');

function Controller(connection) {
  turnpike.EndpointController.call(this, connection);
}
util.inherits(Controller, turnpike.EndpointController);

Controller.prototype._GET = function(readyCallback) {
  var view = turnpike.invokeView('Index');
  view = new view();
  view.mode('main').render(_(function(html) {
    this.connection.status(200).response(html);
  }).(this));
  readyCallback();
};

Controller.prototype._PUT = function(readyCallback) {
  readyCallback();
};

Controller.prototype._POST = function(readyCallback) {
  readyCallback();
};

Controller.prototype._DELETE = function(readyCallback) {
  readyCallback();
};

module.exports = Controller;
