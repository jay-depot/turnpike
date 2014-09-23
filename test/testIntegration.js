/**
 * Run each test under ./integration, one at a time.
 * Each one will likely need to pollute global namespace, and thus will need to be run in a forked process.
 */

var fs = require('fs');
var files = fs.readdirSync(fs.realpathSync('./test/integration'));
var shell = require('shelljs');
var pattern = /^(test)\w*\.js$/;

for (var i in files) {
  if (files.hasOwnProperty(i)) {
    pattern.lastIndex = 0;
    if (pattern.test(files[i])) {
      exports[files[i]] = function(file, assert) {
        file = './test/integration/' + file;
        console.log(file);
        shell.exec('node ' + file, function(code, output) {
          console.log(output);
          assert.equal(code, 0, "Integration run must exit with 0 status");
        });
      }.bind(this, files[i])
    }
  }
}
