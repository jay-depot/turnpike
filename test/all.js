/**
 * General test runner
 */

var fs = require('fs');
var files = fs.readdirSync(fs.realpathSync('./test'));

for (var i in files) {
  var pattern = /^(test)\w*\.js$/;
  if (files.hasOwnProperty(i)) {
    pattern.lastIndex = 0;
    if (pattern.test(files[i])) {
      exports[files[i]] = require('./' + files[i].replace(/\.js/, ''));
    }
  }
}

require('test').run(exports);
