#!/usr/bin/env node
/* Turnpike command-line support utility
 * Handles the case where the turnpike command line utility is asked to
 * "create view [name]" or "create view for [name]"
 */

var indent = "    ";
var path = require('path');
var fs = require('fs');

function generate_all_templates_in(BaseModel, BaseController, name) {
  var model = new BaseModel();
  var controller = new BaseController();
  var fieldMapper = controller.fieldMapper;
  var item = model.fields();
  var form_code = generate_form(item, fieldMapper, name);
  var display_code = generate_display(item, fieldMapper, name);
  var current_dir = process.cwd();

  //create
  fs.writeFileSync(path.join(current_dir, 'application', 'views', name, 'create.jade'), display_code.join('\n'));
  //edit_form
  fs.writeFileSync(path.join(current_dir, 'application', 'views', name, 'edit_form.jade'), form_code.join('\n'));
  //edit
  fs.writeFileSync(path.join(current_dir, 'application', 'views', name, 'edit.jade'), display_code.join('\n'));
  //index
  fs.writeFileSync(path.join(current_dir, 'application', 'views', name, 'index.jade'), generate_index(item, fieldMapper, name));
  //main
  fs.writeFileSync(path.join(current_dir, 'application', 'views', name, 'main.jade'), display_code.join('\n'));
  //remove_form
  fs.writeFileSync(path.join(current_dir, 'application', 'views', name, 'remove_form.jade'), generate_delete_confirm(display_code));
  //remove
  fs.writeFileSync(path.join(current_dir, 'application', 'views', name, 'remove.jade'), '.confirmation The item was deleted.');

  console.log('Done');
  process.exit(0);
}

function generate_index(item, fieldMapper, name) {
  //Returns an array of lines of Jade code. Returns an array so we can loop
  //through it later and further indent the lines for wrapping in additonal
  //markup before flattening into actual code.
  var template = [];
  var property;
  var line;

  template.push('each item in items');
  template.push(indent + 'div.' + name.toLowerCase() + '-item');

  for (property in item) {
    if (item.hasOwnProperty(property) && typeof(item[property] !== "function")) {
      line = indent + indent;
      line += 'div.' + fieldMapper(property, true) + '-label ' + property + ':';
      line += '\n' + indent + indent;
      line += 'div.' + fieldMapper(property, true) + '-value #{item.' + fieldMapper(property, true) + '}';
      template.push(line);
    }
  }

  return template;
}

function generate_delete_confirm(display_code) {
  var code = [];

  code.push('form(method="post" enctype="application/x-www-form-urlencoded")');
  code.push(indent + '.delete-confirm Are you sure you want to delete this item?')
  code.push(indent + 'input(type="submit" name="delete" value="Delete")');

  return code.join('\n') + '\n' + display_code.join('\n');
}

function generate_form(item, fieldMapper, name) {
  //Returns an array of lines of Jade code. Returns an array so we can loop
  //through it later and further indent the lines for wrapping in additonal
  //markup before flattening into actual code.
  var template = [];
  var property;
  var line;
  template.push('form(method="post" enctype="application/x-www-form-urlencoded").' + name.toLowerCase() + '-edit-form');

  for (property in item) {
    if (item.hasOwnProperty(property) && typeof(item[property] !== "function")) {
      line = indent;
      line += 'label(for="' + fieldMapper(property, true) + '") ' + property + ':';
      line += '\n' + indent;
      line += 'input(type="text" name="' + fieldMapper(property, true) + '" value=' + fieldMapper(property, true) + ')';
      template.push(line);
    }
  }

  template.push(indent + 'input(type="submit" name="save" value="Save").' +
    name.toLowerCase() + '-edit-form-submit');

  return template;
}

function generate_display(item, fieldMapper, name) {
  //Returns an array of lines of Jade code. Returns an array so we can loop
  //through it later and further indent the lines for wrapping in additonal
  //markup before flattening into actual code.
  var template = [];
  var property;
  var line;
  template.push('div.' + name.toLowerCase() + '-item');

  for (property in item) {
    if (item.hasOwnProperty(property) && typeof(item[property] !== "function")) {
      line = indent;
      line += 'div.' + fieldMapper(property, true) + '-label ' + property + ':';
      line += '\n' + indent;
      line += 'div.' + fieldMapper(property, true) + '-value #{' + fieldMapper(property, true) + '}';
      template.push(line);
    }
  }

  return template;
}

function create_view(options, skeletons) {
  var Model;
  var Controller;
  var current_dir = process.cwd();

  if (options[0].toLowerCase() === "for") {
    //find model, load it, and instantiate an Item() from it.
    try {
      Model = require(path.join(current_dir, 'application', 'models', options[1]));
    }
    catch (e) {
      console.error('You asked me to create a view for ' + options[1] +
        ', but I can not load that model for some reason.');
      process.exit(4);
    }

    try {
      Controller = require(path.join(current_dir, 'application', 'controllers', options[1]));
    }
    catch (e) {
      console.error('You asked me to create a view for ' + options[1] +
        ', but I can not load that controller for some reason.');
      process.exit(4);
    }

    try {
      fs.mkdirSync(path.join(current_dir, 'application', 'views', options[1]));
    }
    catch (e) {
      console.error('You asked me to create a view for ' + options[1] +
        '. There was an error creating the directory. Check if it already exists.');
      process.exit(5);
    }

    generate_all_templates_in(Model, Controller, options[1]);
  }
  else {
    try {
      fs.mkdirSync(path.join(current_dir, 'application', 'views', options[0]));
    }
    catch (e) {
      console.error('You asked me to create a view called ' + options[0] +
        '. There was an error creating the directory. Check if it already exists.');
      process.exit(5);
    }

    fs = require('fs-extra');
    fs.copy(path.join(skeletons, 'view'), path.join(current_dir, 'application', 'views', options[0]));
    console.log(path.join(current_dir, 'application', 'views', options[0]));
    console.log('Done');
  }
}


exports.create_view = create_view;
