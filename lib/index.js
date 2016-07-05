require("babel-register")({
  presets: [
    "es2015-node5"
  ],
});

var path = require('path');
var autoLoader = require('./internal/autoLoader');

module.exports = autoLoader.load(path.dirname(module.filename));
