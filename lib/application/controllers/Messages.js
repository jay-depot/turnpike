var EndpointController = require('../../classes/base/controller/EndpointController');
var util     = require('util');

/**
 * Messages controller.
 * @constructor
 */
function Messages(connection) {
  EndpointController.call(this, connection);
}
util.inherits(Messages, EndpointController);

/**
 * Controller action to retrieve any pending messages for this connection's
 * session. This deletes all retrieved messages.
 */
Messages.prototype.getMessages = function(readyCallback) {
  this.connection.session.getMessages(function(err, messages) {
    this.data = { 'messages': messages };
    if (!this.data.messages) {
      this.data.messages = [];
    }
    process.nextTick(readyCallback);
  }.bind(this));
};

/**
 * Controller action to delete any pending messages for this connection's
 * session without looking at them.
 */
Messages.prototype.killMessages = function(readyCallback) {
  this.connection.session.getMessages(function(err, messages) {
    this.data = {'status': 'OK'};
    process.nextTick(readyCallback);
  }.bind(this));
};

module.exports = Messages;
