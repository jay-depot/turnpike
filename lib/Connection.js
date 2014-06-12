/**
 * Turnpike plumbing.
 *
 * Connection objects are created by the Turnpike listener, and are passed to EndpointControllers during the routing
 * process.
 */

var _ = require('underscore');
var hooks = require('hooks');
var Negotiator = require('negotiator').Negotiator;
var Session = require ('./Session');

function Connection(req, res) {
  var response = ''
    , headers  = {}
    , status   = 200;

  this.body = '';
  this.method = req.method;
  this.req = req;
  this.res = res;

  /**
   * Completes recieving the connection body (if needed) without treating it as anything special.
   * Normally, this doesn't actually do anything since for most POSTs/PUTs Connect has already
   * taken care of the form parsing, so this is really only useful for dropping unwanted
   * multipart uploads into a black hole.
   */
  this.finish = function() {
    req.on('data', (function(chunk) {
      this.body += chunk;
      if (this.body.length > 1e4) {
        this.die(413, "Request entity too large");
      }
    }).bind(this));
  }

  /**
   * Makes this connection die immediately.
   *
   * @param status number HTTP Status code to return.
   */
  //TODO: This needs a provision to allow passing control into application-specific logic for things like friendly error pages.
  this.die = function(status, message, extra) {
    if (!extra) {
      extra = message;
    }

    message = message || "No reason given by caller";
    res.writeHead(status, message, {'Content-Type': 'text/plain'});
    res.end(extra);

    return this;
  };

  /**
   * Register a handler for the "end" event. I.e. when the full request body
   * is received.
   *
   * If the request is not "readable" by the time this is called, i.e. the
   * end event already fired, then the provided callback will be invoked on
   * process.nextTick
   *
   * @param callback Function to call when connection body is fully received
   */
  this.end = function(callback) {
    if (callback) {
      if(req.readable) {
        req.on('end', callback);
      }
      else {
        process.nextTick(callback);
      }
    }
    return this;
  };

  this.send = function() {
    res.writeHead(status, "OK", headers);
    res.end(response);
  };

  this.header = function(append) {
    if (append) {
      headers = _(headers).extend(append);
      return this;
    }
    else {
      return headers;
    }
  };

  this.status = function(newStatus) {
    if (newStatus) {
      status = newStatus;
      return this;
    }
    else {
      return status;
    }
  };

  this.response = function(string) {
    //Allow passing in a function for the response. Execute it to get the actual response.
    if (typeof(string) == 'function') {
      string = string();
    }

    if (string || string === '') {
      response = string.toString();
      return this;
    }
    else {
      //With no response string given, return the current one;
      return response;
    }
  };

  this.AcceptableMimeTypes = function(types) {
    var negotiator = Negotiator(req);
    return negotiator.preferredMediaTypes(types);
  };

  this.bestMimeType = function(types) {
    var negotiator = Negotiator(req);
    return negotiator.preferredMediaType(types);
  }

  if (Session.enabled) {
    this.session = new Session(req);
  }
}

module.exports = Connection;
