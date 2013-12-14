/**
 * Turnpike plumbing.
 *
 * Connection objects are created by the Turnpike listener, and are passed to EndpointControllers during the routing
 * process.
 */

function Connection(req, res) {
  this.body = '';

  req.on('data', function(chunk) {
    this.body += chunk;
  })

  /**
   * Makes this connection die immediately.
   *
   * @param status number HTTP Status code to return.
   */
  this.die = function(status) {
    res.writeHead(code, {'Content-Type': 'text/plain'});
    req.connection.destroy();
  };

  /**
   * Register a handler for the "end" event. I.e. when the full request body is received.
   *
   * @param callback Function to call when connection body is fully received
   */
  this.end = function(callback) {
    req.on('end', callback);
  };

  return this;
}

module.exports = Connection;
