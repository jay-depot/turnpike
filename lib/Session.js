var connect = require('connect');
var GlobalConfig = require('./GlobalConfig');

function Session(req) {

}


//By default, sessions, and therefore CSRF, are off.
//This can be handy for things like, say, UI-less REST services.
Session.csrf = function (req, res, next) { next(); };

Session.enable = function() {
  Session.status = true;
};

//Static methods:
Session.setSessionStorage = function(engine) {
  if (engine) {
    Session.enable();
    Session.engine = engine;
    Session.useCsrf(true);
  }
};

Session.useCsrf = function(state) {
  if (state) {
    Session.csrf = connect.csrf;
  }
  else {
    Session.csrf = function (req, res, next) { next(); };
  }
}

//Wrapper for Connect sessions. Sets up storage and returns the fully-formed session middleware your site wants.
Session.turnpikeSession = function() {
  var session = connect.session,
      settings = { secret: GlobalConfig.session_secret },
      engine = function(req, res, next) {console.log('no session engine');next();};

  if (Session.status) {
    if (Session.engine) {
      settings.store = Session.engine;
    }

    engine = session(settings);
  }

  return engine;
};

module.exports = Session;
