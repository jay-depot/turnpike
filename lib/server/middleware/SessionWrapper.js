var connect = require('express');
var GlobalConfig = require('./../../config');

var Session = {};


//By default, sessions, and therefore CSRF, are off.
//This can be handy for things like, say, UI-less REST services that are using OAuth instead.
Session.csrf = function() { return function (req, res, next) { next(); }; };
Session.csrf.state = false;

//Sessions are dead-simple to turn on, though.
Session.enable = function() {
  Session.status = true;
};

//And it's almost as simple to change the storage engine.
//Since we like DRY code, setting a storage engine also enables sessions.
Session.setSessionStorage = function(engine) {
  if (engine) {
    Session.enable();
    Session.engine = engine;
    //In almost every case, if you're using sesssions, you want CSRF protection too.
    Session.useCsrf(true);
  }
};

//But, If you know what you're doing, it's easy to turn CSRF protection off again.
Session.useCsrf = function(state) {
  if (state) {
    Session.csrf = require('csurf');
    Session.csrf.state = true;
  }
  else {
    Session.csrf = function() { return function (req, res, next) { next(); }; };
    Session.csrf.state = false;
  }
};

//This method is pure plumbing. It wraps Express' sessions so this module can handle them.
Session.turnpikeSession = function() {
  var settings = { secret: GlobalConfig.session_secret };
  var engine = function(req, res, next) {console.log('no session engine');next();};
  var session = require('express-session');
  var express_session;

  if (Session.status) {
    if (Session.engine) {
      settings.store = Session.engine;
    }
    settings.secret = GlobalConfig.session_secret;
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


module.exports = Session;
