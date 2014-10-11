var connect = require('express');
var GlobalConfig = require('./../../config');

function Session(req) {
  var session = req.session;
  var k;

  session.messages = session.messages || [];

  //UI Messages:
  session.setMessage = function(message, callback) {
    /*
     * message should be an object with the following properties:
     * text: A String equal to the HTML formatted text of the message itself.
     * type: a String equal to one of
     *       success
     *       info
     *       warn
     *       error
     */

    session.messages.push(message);
    console.log('saved session messages', session.messages);
    session.save(callback);
  };

  session.getMessages = function(cb) {
    /*
     * Returns an array containing all messages set against the session.
     * This method clears all of the set messages. If you don't intend
     * to display them, you should probably set them again, or access
     * them some other way.
     */

    var messages = session.messages;
    session.messages = [];

    session.save(function(err){
      console.log('retrieved session messages', session.messages);
      cb(err, messages);
    });
  };

  return session;
}


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

//This method is pure plumbing. It wraps Connect's sessions so this module can handle them.
Session.turnpikeSession = function() {
  var settings = { secret: GlobalConfig.session_secret };
  var engine = function(req, res, next) {console.log('no session engine');next();};
  var session = require('express-session')

  if (Session.status) {
    if (Session.engine) {
      settings.store = Session.engine;
    }
    settings.secret = GlobalConfig.session_secret;
    engine = session(settings);
  }

  return engine;
};


module.exports = Session;
