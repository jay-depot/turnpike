/**
 * Turnpike plumbing.
 *
 * Connection objects are created by the Turnpike listener, and are passed to EndpointControllers during the routing
 * process.
 */

function Connection(req, res) {
  this.req = req;
  this.res = res;
  this.body = '';

  /**
   * Makes this connection die immediately.
   *
   * @param status number HTTP Status code to return.
   */
  this.die = function(status) {
    this.res.writeHead(code, {'Content-Type': 'text/plain'});
    this.req.connection.destroy();
  };

  /**
   * Register a handler for the "end" event. I.e. when the full request body is received.
   *
   * @param callback Function to call when connection body is fully received
   */
  this.end = function(callback) {

  };

  return this;
}

module.exports = Connection;
