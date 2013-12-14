/**
 * A 12-factor friendly configuration manager.
 * Every setting the Turnpike framework keeps track of is given a default value here.
 * These values can be overridden in your project's config.json file, and can also
 * finally be overridden with environment variables. In all cases, a matching environment
 * variable should take precendence over any other way a setting can be specified.
 */

var _ = require('underscore');
var config = {
  testing: false,
  port: 1337
};

var load = function(localConfig) {
  _(config).extend(localConfig);
  env_vars();
}

var env_vars = function() {

}

module.exports = config;
