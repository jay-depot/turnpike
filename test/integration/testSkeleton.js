/**
 * Integration test.
 *
 * Create a dummy project in /tmp, link in turnpike, and test connections to it.
 */

var shell = require('shelljs');

console.log('Creating a project skeleton in', shell.tempdir());
shell.cd(shell.tempdir());
shell.exec('turnpike create project Turnpike Test');

