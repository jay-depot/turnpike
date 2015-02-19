var lodash         = require('lodash');
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;

/**
 * @typedef {Object} Action
 * @param {String} classname
 * @param {String} method
 * @param {boolean} instance
 */
/**
 * Parses an action string of the form "Controller#action" for constructed controllers
 * or "Controller.action" for static controllers.
 *
 * Returns the raw string as given if it does not match one of those patterns.
 *
 * @param action_path
 *
 * @returns {Action|String}
 */
exports.parse = function parse(action_path) {
  var ordered;
  if (/^\w+[\#|\.]\w+$/.test(action_path)) {
    action_path = action_path.replace(/(\#|\.)/, '|$&|');
    ordered = action_path.split('|');
    return {'classname': ordered[0], 'method': ordered[2], 'instance': (ordered[1] === '#')};
  }
  else {
    return action_path;
  }
};
