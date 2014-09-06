/**
 * The default controller for your page structure.
 */
var turnpike = require('turnpike');
var util     = require('util');
var _        = turnpike._;

function Page(connection) {
  var $this = this;
  turnpike.EndpointController.call(this, connection);

  //TODO: Should we send error if we get here and the content type isn't HTML?
  this.deliver = function() {
    var view = turnpike.invokeView('Page');
    view = new view();
    view.mode('main').data($this.data)
      .render(function(html) {
        connection.response(html).send();
      });
  };
}
util.inherits(Page, turnpike.EndpointController);


Page.prototype._GET =
Page.prototype._PUT =
Page.prototype._POST =
Page.prototype._DELETE = function(readyCallback) {
  this.data = {
    'body':  this.connection.response(),
    'title': this.connection.controller.title
  };

  process.nextTick(readyCallback);
};

module.exports = Page;
