exports.async = require('async');
exports.connect = exports.express = require('express');
exports.fs = require('fs-extra');
exports.hooks = require('hooks');
exports.jade = require('jade');
exports.multiparty = require('multiparty');
exports.negotiator = require('negotiator');
exports.optimist = require('optimist');
exports.routes = require('routes');
exports.underscore = require('underscore');
exports.underscore.str = require('underscore.string');
exports.underscore.mixin(exports.underscore.str.exports());
exports.underscore.str.include('Underscore.string', 'string'); // => true
