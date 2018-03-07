require("babel-register")({
  presets: [
    'es2015-node5',
  ],
  plugins: [
    'transform-decorators-legacy',
  ],
});

var path = require('path');
var autoLoader = require('./internal/autoLoader');

module.exports = autoLoader.load(path.dirname(module.filename));
