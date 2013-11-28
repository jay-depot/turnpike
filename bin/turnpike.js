#!/usr/bin/env node
/**
 * Turnpike.JS command line utility.
 */
var path = require('path');
var fs = require('fs-extra');
var argv = require('optimist').argv;
var bindir = path.dirname(module.filename);
var moddir = path.normalize(bindir + '/..');
var handler = {};

handler.create = function(target, modifiers) {
  var targets = {};

  targets.project = function(){
    var project = {};

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
    fs.copy(bindir + '/skeletons/project', project.dir);
    //TODO: Write out the correct values into package.json so npm install will pull in Turnpike and the new project can actually run.
    console.log('Your new project, ' + project.name + ', was created in ' + 
      path.normalize(project.dir) + 
      ' You may now enter that directory and start your server by running turnpike drive.');
  };

  if (typeof targets[target] === "function") {
    targets[target]();
  }
};

handler.drive = function(target, modifiers) {
  drive = require('../lib/Drive');
  drive();
};

handler.testdrive = function(target, modifiers) {
  console.log("Starting a test drive");
  require('../lib/GlobalConfig').testing = true;
  drive = require('../lib/Drive');
  drive();
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