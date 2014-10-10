/**
 * Integration test.
 *
 * Create a dummy project in /tmp, link in turnpike, and test connections to it.
 */

var shell = require('shelljs');
var status;

console.log('Creating a project skeleton in', shell.tempdir());
shell.cd(shell.tempdir());
try {
  shell.rm('-rf', 'turnpike-test');
}
catch (ex) {}

status = shell.exec('turnpike create project Turnpike Test');
if (status.code) {
  process.exit(status.code);
}

shell.cd('turnpike-test');
shell.exec('npm link turnpike');
var server = require('child_process').spawn('./node_modules/.bin/turnpike',
  ['testdrive'], {});

server.on('exit', function(code, signal) {
  console.log(code);
  if (code) {
    process.exit(code);
  }
  else if (signal) {
    process.exit(0);
  }
});

//TODO: Instead of just seeing if there are any errors firing up the server. Connect to it, and check response
setTimeout(function(server) {
  server.kill('SIGHUP');
}.bind(this, server), 10000); //For now, we can assume it's working after 10 seconds without an error.
