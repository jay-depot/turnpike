/**
 * Integration test.
 *
 * Create a dummy project in /tmp, link in turnpike, and test connections to it.
 */

var shell = require('shelljs');
var rest  = require('restler');
var status, server;

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
shell.exec('npm install');
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
  rest.get('http://localhost:1337/', {
    headers: { Accept: 'text/html' }
  }).on('complete', function(data, res) {
    if (data instanceof Error) {
      server.kill('SIGHUP');
      console.log(data);
      throw data;
    }
    else {
      server.kill('SIGHUP');
      if (res.statusCode === 200) {
        console.log('Project skeleton server returns 200 status at /');
        process.exit(0);
      }
      else {
        console.log('Project skeleton server does not return 200 status at /');
        process.exit(res.statusCode);
      }
    }
  });
}.bind(this, server), 10000);
