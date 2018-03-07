/**
 * The default controller for your home page.
 */
'use strict';

var turnpike = require('turnpike');
var util     = require('util');
var _        = turnpike.imports.underscore;

class Index extends turnpike.classes.base.controller.WebEndpointController {
  main(params, next) {
    process.nextTick(next);
  };
}

module.exports = Index;
