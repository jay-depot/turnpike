/**
 * The default controller for your page structure.
 */
var turnpike = require('turnpike');
var util     = require('util');
var _        = require('underscore');

function Page(connection) {
  this.data = {
    'body':  connection.response(),
    'title': connection.controller.title
  };

  turnpike.EndpointController.call(this, connection);

  //TODO: Should we send error if we get here and the content type isn't HTML?
  this.deliver = function() {
    var view = turnpike.invokeView('Page');
    view = new view();
    view.mode('main').data(this.data)
      .render(function(html) {
        connection.response(html).send();
      });
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
