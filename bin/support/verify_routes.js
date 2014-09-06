var AutoLoader = require('../../lib/internal/AutoLoader'),
    ActionParser = require('../../lib/server/ActionParser'),
    driver = require('../../lib/server/drive').Driver,
    fs      = require('fs-extra');


function verify_path(path) {
  if (!/[[\/\w+]|[\/\:\w+]]+/.test(path)) {
    console.error('Malformed path: ' + path);
    process.exit(1);
  }
}

function verify_action(path, target) {
  var controller;

  action = ActionParser.parse(target);
  if (typeof(action) === 'object') {
    controller = AutoLoader.invoke(action.classname);

    if (action.instance) {
      controller = new controller();
    }

    if (typeof(controller[action.method]) !== 'function') {
      console.error('Action specified by ' + target + ' for ' + path +' is not a function.')
      process.exit(1);
    }
  }
  else if (typeof(target) === 'string') {
      if(typeof(AutoLoader.invoke(target)) !== 'function') {
      console.error('Bare controllers as route actions need to exist. '
        + target + ' does not appear to.');
      process.exit(1);
    }
  }
  else {
    console.error('Something weird happened around the route for ' + path);
    process.exit(1);
  }
  return true;
}

function verify_object_target(path, target) {
  for (http_method in target) {
    if (target.hasOwnProperty(http_method)) {
      if(!/^[OPTIONS]|[GET]|[HEAD]|[POST]|[PUT]|[DELETE]|[TRACE]|[CONNECT]$/.test(http_method)){
        console.error('Sub-objects for route destination must be a map of vald HTTP methods ' +
          http_method + ' found in the actions for ' + path + 'is not a valid HTTP method.');
        process.exit(1);
      }
      verify_action(path, target[http_method]);
    }
  }

  return true;
}

module.exports = function() {
  var http_method,
      path,
      routes = fs.readJSONSync('./routes.json');

  driver.startAutoloader(function() {
    var controller,
        action;

    for (path in routes) {
      if (routes.hasOwnProperty(path)) {
        console.log('Checking route: ' + path);
        verify_path(path);

        if (typeof(routes[path]) === 'string') {
          //it's either a valid action spec, or a bare controller.
          verify_action(path, routes[path]);
        }
        else if (typeof(routes[path]) === 'object') {
          verify_object_target(path, routes[path]);
        }
      }
    }
    console.log('Routes are OK');
  });
};
