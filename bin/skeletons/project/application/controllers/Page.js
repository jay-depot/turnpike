/**
 * The default controller for your page structure.
 */
var turnpike = require('turnpike');
var util     = require('util');
var _        = turnpike.imports.underscore;

/**
 * Controller that composes page elements and prepares a complete HTML document for delivery.
 *
 * @param connection
 * @constructor
 */
function Page(connection) {
  turnpike.classes.base.controller.PageComposerController.call(this, connection);

  this.prepare = function(next) {
    this.mode = 'main';

    this.data = {
      'body':  this.connection.response(),
      'title': this.connection.controller.title + ' | ' + turnpike.config.sitename
    };

    process.nextTick(next);
  };
}
util.inherits(Page, turnpike.classes.base.controller.PageComposerController);

module.exports = Page;
