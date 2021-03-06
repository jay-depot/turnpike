var EndpointController = require('./EndpointController');
var Renderable = require('./../../Renderable');
var util = require('util');

/**
 * The recommended base for your Page controller.
 *
 * @constructor
 */
function PageComposerController(connection) {
  var application = require('./../../../index').application;

  EndpointController.call(this, connection);

  this.deliver = function() {
    var view = new Renderable(application.views[this.view]);
    view.mode = this.mode || 'main';
    view.data = this.data;

    view.render(function(html) {
      connection.response(html).send();
    });
  }.bind(this);
}
EndpointController.extend(PageComposerController);

module.exports = PageComposerController;
