#!/usr/bin/env node
/* Turnpike command-line support utility
 * Handles the case where the turnpike command line utility is asked to
 * "create view [name]" or "create view for [name]"
 */

var indent = "    ";
var path = require('path');
var fs = require('fs');

function generate_all_templates_in(BaseModel, name) {
  var model = new BaseModel();
  var item = model.fields();
  var form_code = generate_form(item, name);
  var display_code = generate_display(item, name);
  var current_dir = process.cwd();

  console.dir(model.Item);
  console.dir(item);
  console.log(form_code);
  console.log(display_code);

  //create
  fs.writeFileSync(path.join(current_dir, 'api', 'views', name, 'create.jade'), display_code.join('\n'));
  //edit_form
  fs.writeFileSync(path.join(current_dir, 'api', 'views', name, 'edit_form.jade'), form_code.join('\n'));
  //edit
  fs.writeFileSync(path.join(current_dir, 'api', 'views', name, 'edit.jade'), display_code.join('\n'));
  //index
  fs.writeFileSync(path.join(current_dir, 'api', 'views', name, 'index.jade'), generate_index(item, name));
  //main
  fs.writeFileSync(path.join(current_dir, 'api', 'views', name, 'main.jade'), display_code.join('\n'));
  //remove_form
  fs.writeFileSync(path.join(current_dir, 'api', 'views', name, 'remove_form.jade'), generate_delete_confirm(display_code));
  //remove
  fs.writeFileSync(path.join(current_dir, 'api', 'views', name, 'remove.jade'), '.confirmation The item was deleted.');
  process.exit(0);
}

function generate_index(item, name) {
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
      line += 'div.' + property + '-label ' + property + ':';
      line += '\n' + indent + indent;
      line += 'div.' + property + '-value #{item.' + property + '}';
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

function generate_form(item, name) {
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
      line += 'label(for="' + property + '") ' + property + ':';
      line += '\n' + indent;
      line += 'input(type="text" name="' + property + '" value=' + property + ')';
      template.push(line);
    }
  }

  template.push(indent + 'input(type="submit" name="save" value="Save").' +
    name.toLowerCase() + '-edit-form-submit');

  return template;
}

function generate_display(item, name) {
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
      line += 'div.' + property + '-label ' + property + ':';
      line += '\n' + indent + indent;
      line += 'div.' + property + '-value #{' + property + '}';
      template.push(line);
    }
  }

  return template;
}

function create_view(options) {
  if (options[0].toLowerCase() === "for") {
    //find model, load it, and instantiate an Item() from it.
    var Model;
    var current_dir = process.cwd();

    try {
      Model = require(path.join(current_dir, 'api', 'models', options[1]));
    }
    catch (e) {
      console.error('You asked me to create a view for ' + options[1] +
        ', but I can not load that model for some reason.');
      process.exit(4);
    }

    try {
      fs.mkdirSync(path.join(current_dir, 'api', 'views', options[1]));
    }
    catch (e) {
      console.error('You asked me to create a view for ' + options[1] +
        '. There was an error creating the directory. Check if it already exists.');
      process.exit(5);
    }

    generate_all_templates_in(Model, options[1]);
  }
  else {
    //Dump out generic view modes matching the generic controller actions.
    //This can be done straight from the skeletons
  }
}


exports.create_view = create_view;
