/**
 * The default controller for your home page.
 */
var turnpike = require('turnpike');

module.exports = function(req, res, body, path) {
  var controller = turnpike.EndpointController.extend(req, res, body, path);
  this.public = controller.public;
  this.protected = controller.protected;

  this.protected._GET = function(readyCallback) {
    readyCallback();
  };

  this.protected._PUT = function(readyCallback) {
    readyCallback();
  };

  this.protected._POST = function(readyCallback) {
    readyCallback();
  };

  this.protected._DELETE = function(readyCallback) {
    readyCallback();
  };

  return this.public;
};
