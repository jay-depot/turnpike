/**
 * Turnpike plumbing.
 *
 * Connection objects are created by the Turnpike listener, and are passed to EndpointControllers during the routing
 * process.
 */

var _ = require('underscore');
var hooks = require('hooks');
var Negotiator = require('negotiator').Negotiator;
var Session = require ('./../server/middleware/SessionWrapper');

var status_code = {
  '100': 'Continue',
  '101': 'Switching Protocols',
  '200': 'OK',
  '201': 'Created',
  '202': 'Accepted',
  '203': 'Non-Authoritative Information',
  '204': 'No Content',
  '205': 'Reset Content',
  '206': 'Partial Content',
  '300': 'Multiple Choices',
  '301': 'Moved Permanently',
  '302': 'Found',
  '303': 'See Other',
  '304': 'Not Modified',
  '305': 'Use Proxy',
  '307': 'Temporary Redirect',
  '400': 'Bad Request',
  '401': 'Unauthorized',
  '402': 'Payment Required',
  '403': 'Forbidden',
  '404': 'Not Found',
  '405': 'Method Not Allowed',
  '406': 'Not Acceptable',
  '407': 'Proxy Authentication Required',
  '408': 'Request Timeout',
  '409': 'Conflict',
  '410': 'Gone',
  '411': 'Length Required',
  '412': 'Precondition Failed',
  '413': 'Request Entity Too Large',
  '414': 'Request-URI Too Long',
  '415': 'Unsupported Media Type',
  '416': 'Requested Range Not Satisfiable',
  '417': 'Expectation Failed',
  '500': 'Internal Server Error',
  '501': 'Not Implemented',
  '502': 'Bad Gateway',
  '503': 'Service Unavailable',
  '504': 'Gateway Timeout',
  '505': 'HTTP Version Not Supported'
};

function Connection(req, res, next) {
  var response = ''
    , headers  = {}
    , status   = 200;

  this.body = '';
  this.method = req.method;
  this.req = req;
  this.res = res;
  this.session = new Session(req);

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
   * @param message not used - deprecated
   * @param extra Information to include in the response body
   */
  //TODO: This needs a provision to allow passing control into application-specific logic for things like friendly error pages.
  this.die = function(status, message, extra) {
    if (!extra) {
      extra = message;
    }
    message = status_code[status];
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

  /**
   * Redirect a request to another location.
   * code is the HTTP status code to use for the redirect. Any number is
   * allowed here, but deviate from RFCs at your own risk ;-)
   * location is the URL to which you want to redirect.
   */
  this.redirect = function(code, location) {
    res.writeHead(code,status_code[code], {'location': location});
    res.end(response);
    return this;
  };

  this.send = function() {
    res.writeHead(status, status_code[status], headers);
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

  this.bestMimeType = function(types) {
    var negotiator = Negotiator(req);
    return negotiator.preferredMediaType(types);
  }

  if (Session.enabled) {
    this.session = new Session(req);
  }
}

module.exports = Connection;
