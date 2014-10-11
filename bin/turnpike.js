#!/usr/bin/env node
/**
 * Turnpike.JS command line utility.
 */
var path = require('path');
var fs = require('fs-extra');
var bindir = path.dirname(module.filename);
var moddir = path.normalize(bindir + '/..');
var turnpike;
var cmdln = require('cmdln');
var util = require('util');

try {
  turnpike = require(path.join(process.cwd(), 'node_modules', 'turnpike'));
}
catch (e) {
  turnpike = require(moddir);
}

turnpike.config.initialize();

function Turnpike() {
  cmdln.Cmdln.call(this, {
    'name': 'turnpike',
    'desc': 'turnpike command-line utility. Generate projects and project components or start a server',
    'options': [
      {names: ['help', 'h'], type: 'bool', help: 'Print help and exit.'},
      {names: ['version', 'v'], type: 'bool', help: 'Print version and exit.'}
    ]
  });
} util.inherits(Turnpike, cmdln.Cmdln);

Turnpike.prototype.do_drive = function(subcmd, opts, args, cb) {
  var turnpike;
  try {
    turnpike = require(path.join(process.cwd(), 'node_modules', 'turnpike'));
  }
  catch (e) {
    console.error('Could not load turnpike from ./node_modules.' +
      ' Make sure the current directory is a Turnpike project, and you have run npm install');
    process.exit(1);
  }
  turnpike.server.drive();
};

Turnpike.prototype.do_drive.help = (
  'Run project in current directory in production mode\n'
  + '\n'
  + 'Usage:\n'
  + '{{name}} drive\n'
  + '\n'
  + '\n'
  );

Turnpike.prototype.do_testdrive = function(subcmd, opts, args, cb) {
  var turnpike;
  try {
    turnpike = require(path.join(process.cwd(), 'node_modules', 'turnpike'));
  }
  catch (e) {
    console.error('Could not load turnpike from node_modules.' +
      ' Make sure the current directory is a Turnpike project, and you have run npm install');
    process.exit(1);
  }
  console.log("Starting a test drive on port " + turnpike.config.port);
  turnpike.config.testing = true;
  this.do_drive(subcmd, opts, args, cb);
};

Turnpike.prototype.do_testdrive.help = (
  'Run project in current directory in testing mode\n'
  + '\n'
  + 'Usage:\n'
  + '{{name}} testdrive\n'
  + '\n'
  + '\n'
);

Turnpike.prototype.do_create = TurnpikeCreate;

Turnpike.prototype.init = function (opts, args, cb) {
  if (opts.version) {
    console.log(turnpike.config.turnpike.version);
    return cb(false);
  }
  cmdln.Cmdln.prototype.init.apply(this, arguments);
};

function TurnpikeCreate() {
  cmdln.Cmdln.call(this, {
    'name': 'turnpike create',
    'desc': 'Create a new project, or a new access ruleset, collection, controller, or view in the current project',
    'options': []
  });
} util.inherits(TurnpikeCreate, cmdln.Cmdln);

TurnpikeCreate.prototype.do_project = function(subcmd, opts, name, cb) {
  var project = {};
  var pkg = {};
  var turnpike_pkg = fs.readJsonSync(path.join(moddir, 'package.json'));
  var config = {};

  if (name.length < 1) {
    console.log("Usage: turnpike create project <Project Name>");
    process.exit(1);
  }

  project.name = name.join(' ');
  project.dir = name.join('-').toLowerCase();

  if (fs.existsSync(project.dir)) {
    console.log("Error: directory " + project.dir + " already exists. Not modified.");
    process.exit(2);
  }

  console.log('creating project: ' + project.name + ' in ' + project.dir);
  fs.copySync(bindir + '/skeletons/project', project.dir);
  pkg.name = project.dir;
  pkg.version = '0.0.1';
  pkg.main = 'app.js';
  pkg.dependencies = {
    'turnpike': turnpike_pkg.version
  };
  fs.writeJsonSync(path.join(project.dir, 'package.json'), pkg);
  config.sitename = project.name;
  fs.writeJsonSync(path.join(project.dir, 'config.json'), config);
  console.log('Your new project, ' + project.name + ', was created in ' +
    path.normalize(project.dir) +
    ' You may now enter that directory, run npm install, and start your server by running turnpike drive.');
  cb();
};

TurnpikeCreate.prototype.do_project.help = (
  'Creates a skeleton project of the given name in the current directory.\n'
    + '\n'
    + 'Usage:\n'
    + '{{name}} create project <Project Name>\n'
    + '\n'
    + '\n'
  );

TurnpikeCreate.prototype.do_access = function(subcmd, options, args, cb) {
  var template;
  var output;

  if (args.length !== 1) {
    console.log('Usage: turnpike create access <controller>\n');
    process.exit(1);
  }

  template = _.template(fs.readFileSync(path.join(bindir, 'skeletons', 'access', 'template.ejs'),
    {'encoding': 'utf8'}));

  output = template({
    'name': args[0]
  });

  fs.writeFileSync(path.join('application', 'access', args + '.js'), output);
  cb();
};

TurnpikeCreate.prototype.do_access.help = (
  'Creates an access ruleset scaffold for the given controller.\n'
    + '\n'
    + 'Usage:\n'
    + '{{name}} create access <controller>\n'
    + '\n'
    + '\n'
  );

TurnpikeCreate.prototype.do_view = function(subcmd, options, args, cb) {
  if (name.length < 1) {
    console.error('You asked me to create a view, but did not give a name');
    process.exit(2);
  }
  else if (name.length === 1 && name[0].toLowerCase() === 'for') {
    console.error('You asked me to create a view for a model, but did not give a name');
    process.exit(2);
  }
  else {
    var create_view = require('./support/create_view').create_view;
    create_view(name, path.join(bindir, 'skeletons'));
  }
};

if (require.main === module) {
  cmdln.main(new Turnpike(), {showErrStack: true});
}

/*
program
  .command('create <type> <name>')
  .description('create a new project')
  .action(function(type, name) {
    var targets = {};

    name = name.split(' ');

    targets.controller = function(attachModel) {
      var template,
        output,
        name = name[0];

      attachModel = attachModel || false;
      template = _.template(fs.readFileSync(path.join(bindir, 'skeletons', 'controller', 'template.ejs'), {'encoding': 'utf8'}));

      output = template({
        'name': name,
        'attachModel': attachModel
      });

      fs.writeFileSync(path.join('application', 'controllers', name + '.js'), output);
    };

    targets.collection = function() {};


    if (typeof targets[type] === "function") {
      targets[type]();
    }
  });

program.parse(process.argv);

/*
handler.verify = function(target, modifiers) {
  var targets = {};

  targets.routes = require('./support/verify_routes');

  if (typeof targets[target] === "function") {
    targets[target]();
  }
};
*/
