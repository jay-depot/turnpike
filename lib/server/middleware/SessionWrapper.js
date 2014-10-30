var connect = require('express');
var GlobalConfig = require('./../../config');

/**
 * @in turnpike.server.middleware
 * @namespace
 */
var SessionWrapper = {};


SessionWrapper.csrf = function() { return function (req, res, next) { next(); }; };
SessionWrapper.csrf.state = false;

/**
 * By default, sessions, and therefore CSRF, are off.
 * This can be handy for things like, say, UI-less REST services that are using OAuth instead.
 * This method enables them.
 */
SessionWrapper.enable = function() {
  SessionWrapper.status = true;
};

//And it's almost as simple to change the storage engine.
//Since we like DRY code, setting a storage engine also enables sessions.
SessionWrapper.setSessionStorage = function(engine) {
  if (engine) {
    SessionWrapper.enable();
    SessionWrapper.engine = engine;
    //In almost every case, if you're using sesssions, you want CSRF protection too.
    SessionWrapper.useCsrf(true);
  }
};

//But, If you know what you're doing, it's easy to turn CSRF protection off again.
SessionWrapper.useCsrf = function(state) {
  if (state) {
    SessionWrapper.csrf = require('csurf');
    SessionWrapper.csrf.state = true;
  }
  else {
    SessionWrapper.csrf = function() { return function (req, res, next) { next(); }; };
    SessionWrapper.csrf.state = false;
  }
};

//This method is pure plumbing. It wraps Express' sessions so this module can handle them.
SessionWrapper.turnpikeSession = function() {
  var settings = { secret: GlobalConfig.session_secret };
  var engine = function(req, res, next) {console.log('no session engine');next();};
  var session = require('express-session');
  var express_session;

  if (SessionWrapper.status) {
    if (SessionWrapper.engine) {
      settings.store = SessionWrapper.engine;
    }
    settings.secret = GlobalConfig.session_secret;
    settings.resave = true;
    settings.saveUninitialized = false;
    express_session = session(settings);

    engine = function (req, res, next) {
      express_session(req, res, function() {
        console.log(req);
        req.session.messages = req.session.messages || [];

        //UI Messages:
        req.session.setMessage = function(message, callback) {
          /*
           * message should be an object with the following properties:
           * text: A String equal to the HTML formatted text of the message itself.
           * type: a String equal to one of
           *       success
           *       info
           *       warn
           *       error
           */

          req.session.messages.push(message);
          console.log('saved session messages', session.messages);
          req.session.save(callback);
        };

        req.session.getMessages = function(cb) {
          /*
           * Returns an array containing all messages set against the session.
           * This method clears all of the set messages. If you don't intend
           * to display them, you should probably set them again, or access
           * them some other way.
           */

          var messages = req.session.messages;
          req.session.messages = [];

          req.session.save(function(err){
            console.log('retrieved session messages', session.messages);
            cb(err, messages);
          });
        };

        next(false, req, res);
      });
    };
  }

  return engine;
};


module.exports = SessionWrapper;
