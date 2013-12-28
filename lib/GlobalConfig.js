/**
 * A 12-factor friendly configuration manager.
 * Every setting the Turnpike framework keeps track of is given a default value here.
 * These values can be overridden in your project's config.json file, and can also
 * finally be overridden with environment variables. In all cases, a matching environment
 * variable should take precendence over any other way a setting can be specified.
 */

var _  = require('underscore');

var config = {
  testing: false,
  port: 1337
};

var env_vars = function() {
  var name = "";
  for (name in process.env) {
    if (process.env.hasOwnProperty(name)) {
      config[name.toLowerCase()] = process.env[name];
    }
  }
}

_.once(function() {
  var path        = require('path');
  var fs          = require('fs-extra');
  var moddir      = path.resolve(path.dirname(module.filename), '..');
  var cwd         = process.cwd();
  var localConfig = {};

  try {
    localConfig = fs.readJsonSync(path.join(cwd, 'config.json'));
  }
  catch (err) {console.log('No local config file found.');}

  _(config).extend(localConfig);
  config.turnpike = fs.readJsonSync(path.join(moddir, 'package.json'));

  try {
    config.app = fs.readJsonSync(path.join(cwd, 'package.json'));
  }
  catch (err) {console.log('No local config file found.');}

  env_vars();
})();

module.exports = config;
