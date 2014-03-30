/**
 * Returns an object describing what autoloader class to invoke, whether to
 * instantiate it, and what method to call.
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
