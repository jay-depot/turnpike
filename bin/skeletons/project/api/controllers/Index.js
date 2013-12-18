/**
 * The default controller for your home page.
 */
var turnpike = require('turnpike');
var util     = require('util');

function Controller(connection) {
  turnpike.EndpointController.call(this, connection);
}
util.inherits(Controller, turnpike.EndpointController);

Controller.prototype._GET = function(readyCallback) {
  connection.status(200).response(turnpike.invokeView("Index"));
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
