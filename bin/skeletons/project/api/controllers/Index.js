/**
 * The default controller for your home page.
 */
var turnpike = require('turnpike');
var util     = require('util');
var _        = require('underscore');

function Index(connection) {
  turnpike.EndpointController.call(this, connection);
}
util.inherits(Index, turnpike.EndpointController);

Index.prototype._GET = function(readyCallback) {
  var view = turnpike.invokeView('Index');
  view = new view();
  view.mode('main').render(_(function(html) {
    this.connection.status(200).response(html);
    readyCallback();
  }).bind(this));
};

Index.prototype._PUT = function(readyCallback) {
  process.nextTick(readyCallback);
};

Index.prototype._POST = function(readyCallback) {
  process.nextTick(readyCallback);
};

Index.prototype._DELETE = function(readyCallback) {
  process.nextTick(readyCallback);
};

module.exports = Index;
