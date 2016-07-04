exports.async = require('async');
exports.connect = exports.express = require('express');
exports.express_session = require('express-session');
exports.fs = require('fs-extra');
exports.hooks = require('hooks');
exports.jade = require('jade');
exports.multiparty = require('multiparty');
exports.negotiator = require('negotiator');
exports.underscore = require('lodash');
exports.underscore.str = require('underscore.string');
exports.underscore.mixin(exports.underscore.str.exports());
exports.underscore.str.include('Underscore.string', 'string'); // => true
