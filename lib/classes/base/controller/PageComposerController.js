/**
 * The default controller for your page structure.
 */
var EndpointController = require('./EndpointController');
var Renderable = require('./../../Renderable');
var util = require('util');

function PageComposerController(connection) {
  var application = require('./../../../index').application;

  EndpointController.call(this, connection);

  this.deliver = function() {
    var view = new Renderable(application.views[this.view]);
    view.mode = this.mode || 'main';
    view.data = this.data;

    console.log(view);

    view.render(function(html) {
      connection.response(html).send();
    });
  }.bind(this);
}
util.inherits(PageComposerController, EndpointController);

module.exports = PageComposerController;
