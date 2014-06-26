#!/usr/bin/env node
/**
 * Turnpike.JS command line utility.
 */
var path    = require('path');
var fs      = require('fs-extra');
var argv    = require('optimist').argv;
var _       = require('underscore');
var bindir  = path.dirname(module.filename);
var moddir  = path.normalize(bindir + '/..');
var handler = {};

handler.create = function(target, modifiers) {
  var targets = {};

  targets.access = function() {
    var template,
        output,
        name = modifiers[0];

    template = _.template(fs.readFileSync(path.join(bindir, 'skeletons', 'access', 'template.ejs'), {'encoding': 'utf8'}));

    output = template({
      'name': name
    });

    fs.writeFileSync(path.join('api', 'access', name + '.js'), output);
  }

  targets.project = function() {
    var project = {};
    var pkg = {};
    var turnpike_pkg = fs.readJsonSync(path.join(moddir, 'package.json'));

    if (modifiers.length < 1) {
      console.log("Usage: turnpike create project [Project Name]");
      process.exit(1);
    }

    project.name = modifiers.join(' ');
    project.dir = modifiers.join('-').toLowerCase();

    if (fs.existsSync(project.dir)) {
      console.log("Error: directory " + project.dir + " already exists. Not modified.");
      process.exit(2);
    }

    console.log('creating project: ' + project.name + ' in ' + project.dir);
    fs.copySync(bindir + '/skeletons/project', project.dir);
    //TODO: Write out the correct values into package.json so npm install will pull in Turnpike and the new project can actually run.
    pkg.name = project.dir;
    pkg.version = '0.0.1';
    pkg.main = 'app.js';
    pkg.dependencies = {
      'turnpike': turnpike_pkg.version
    };
    fs.writeJsonSync(path.join(project.dir, 'package.json'), pkg);
    console.log('Your new project, ' + project.name + ', was created in ' +
      path.normalize(project.dir) +
      ' You may now enter that directory, run npm install, and start your server by running turnpike drive.');
  };

  targets.controller = function(attachModel) {
    var template,
        output,
        name = modifiers[0];

    attachModel = attachModel || false;
    template = _.template(fs.readFileSync(path.join(bindir, 'skeletons', 'controller', 'template.ejs'), {'encoding': 'utf8'}));

    output = template({
      'name': name,
      'attachModel': attachModel
    });

    fs.writeFileSync(path.join('api', 'controllers', name + '.js'), output);
  };

  targets.model = function() {};

  targets.view = function() {
    if (modifiers.length < 1) {
      console.error('You asked me to create a view, but did not give a name');
      process.exit(2);
    }
    else if (modifiers.length === 1 && modifiers[0].toLowerCase() === 'for') {
      console.error('You asked me to create a view for a model, but did not give a name');
      process.exit(2);
    }
    else {
      var create_view = require('./support/create_view').create_view;
      create_view(modifiers, path.join(bindir, 'skeletons'));
    }
  };

  targets.endpoint = function() {};

  targets.endpoints = function() {};

  targets.entity = function() {};

  if (typeof targets[target] === "function") {
    targets[target]();
  }
};

handler.verify = function(target, modifiers) {
  var targets = {};

  targets.routes = require('./support/verify_routes');

  if (typeof targets[target] === "function") {
    targets[target]();
  }
};

handler.drive = function(target, modifiers) {
  var turnpike;
  try {
    turnpike = require(path.join(process.cwd(), 'node_modules', 'turnpike'));
  }
  catch (e) {
    console.error('Could not load turnpike from node_modules.' +
      ' Make sure the current directory is a Turnpike project, and you have run npm install');
    process.exit(1);
  }
  turnpike.drive();
};

handler.testdrive = function(target, modifiers) {
  var turnpike;
  try {
    turnpike = require(path.join(process.cwd(), 'node_modules', 'turnpike'));
  }
  catch (e) {
    console.error('Could not load turnpike from node_modules.' +
      ' Make sure the current directory is a Turnpike project, and you have run npm install');
    process.exit(1);
  }
  console.log("Starting a test drive on port " + require('../lib/GlobalConfig').port);
  turnpike.GlobalConfig.testing = true;
  handler.drive();
};

handler.override = function(target, modifiers) {
  // Copies a core Turnpike Model/View/Controller into the current project,
  // and rewrites the require()'s to say 'turnpike'.
  // This allows you to customize these built-ins for your project easily.
};

if (require.main === module) {
  (function(){
    //console.log(bindir);
    //console.log(moddir);
    //console.dir(argv);

    var sentence = {
      verb: argv._[0],
      object: argv._[1],
      modifiers: argv._.slice(2)
    };

    //console.dir(sentence);

    if (typeof handler[sentence.verb] === "function") {
      handler[sentence.verb](sentence.object, sentence.modifiers);
    }
  })();
}
