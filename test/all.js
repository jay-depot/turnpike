/**
 * General test runner
 */

var fs = require('fs');
var Test = require('test');
var files = fs.readdirSync(fs.realpathSync('./test'));


for (var i in files) {
  if (files.hasOwnProperty(i)) {
    var pattern = /^test\w*\.js$/;
    if (pattern.exec(files[i])) {
      console.log(files[i]);
      var file = require('./' + files[i].replace(/\.js/, ''));
      Test.run(file);
    }
  }
}
