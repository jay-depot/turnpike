require("babel-register")();

var path = require('path');
var autoLoader = require('./internal/autoLoader');

module.exports = autoLoader.load(path.dirname(module.filename));
