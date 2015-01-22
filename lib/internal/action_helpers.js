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

/**
 * @param {function} exemplar
 * @param {function} action
 * @param {Object} params
 * @returns {function}
 */
exports.bind_route_parameters = function bind_route_parameters(exemplar, action, params) {
  var argument_names = get_param_names(exemplar);
  var len = exemplar.length - 1; //assume last parameter is the callback, which we don't want to bind
  var i, name;

  action = lodash.curry(action, exemplar.length);

  for (i = 0; i < len; i++) {
    name = argument_names[i];
    action = action(params[name]);
  }

  return action;
};

/**
 * Returns an array of the names of a function's parameters in proper order
 *
 * @param {function} func
 * @returns {Array}
 */
exports.get_param_names = function get_param_names(func) {
  var fnStr = func.toString().replace(STRIP_COMMENTS, '');
  var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);

  if(result === null) {
    result = [];
  }

  return result;
};
