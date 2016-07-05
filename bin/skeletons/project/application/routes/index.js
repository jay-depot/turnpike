/**
 * Routing for Index controller.
 */

var turnpike = require('turnpike');

module.exports = function() {
  turnpike.router.path('/').
    get(turnpike.action.accessChecked('Index#main'));
};
