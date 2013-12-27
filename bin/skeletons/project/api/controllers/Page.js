/**
 * The default controller for your page structure.
 */
var turnpike = require('turnpike');
var util     = require('util');
var _        = require('underscore');

function Page(connection) {
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
util.inherits(Page, turnpike.EndpointController);


Page.prototype._GET = function(readyCallback) {
  process.nextTick(readyCallback);
};

Page.prototype._PUT = function(readyCallback) {
  process.nextTick(readyCallback);
};

Page.prototype._POST = function(readyCallback) {
  process.nextTick(readyCallback);
};

Page.prototype._DELETE = function(readyCallback) {
  process.nextTick(readyCallback);
};

module.exports = Page;
