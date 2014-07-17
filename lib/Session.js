var connect = require('connect');
var GlobalConfig = require('./GlobalConfig');

function Session(req) {
  var session = req.session;
  var k;

  session.messages = [];

  for (k in this) {
    session[k] = this[k];
  }

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
    Session.csrf = connect.csrf;
    Session.csrf.state = true;
  }
  else {
    Session.csrf = function() { return function (req, res, next) { next(); }; };
    Session.csrf.state = false;
  }
}

//This method is pure plumbing. It wraps Connect's sessions so this module can handle them.
Session.turnpikeSession = function() {
  var settings = { secret: GlobalConfig.session_secret },
      engine = function(req, res, next) {console.log('no session engine');next();};

  if (Session.status) {
    if (Session.engine) {
      settings.store = Session.engine;
    }
    settings.secret = GlobalConfig.session_secret;
    engine = connect.session(settings);
  }

  return engine;
};

//And the point of all this: As if having a code butler than sets up all your connect
//middleware for you weren't enough, is that you get the following extras that connect
//sessions alone don't do:

//UI Messages:
Session.prototype.setMessage = function(message) {
  /*
   * message should be an object with the following properties:
   * text: A String equal to the HTML formatted text of the message itself.
   * type: a String equal to one of
   *       success
   *       info
   *       warn
   *       error
   */

  this.messages.push(message);
}

Session.prototype.getMessages = function(cb) {
  /*
   * Returns an array containing all messages set against the session.
   * This method clears all of the set messages. If you don't intend
   * to display them, you should probably set them again, or access
   * them some other way.
   */

  var messages = this.messages;
  this.messages = [];

  if (typeof(cb) === 'function'){
    process.nextTick(function() {
      cb(false, messages);
    });
  }
}

module.exports = Session;
