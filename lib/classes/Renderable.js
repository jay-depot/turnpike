var hooks = require('hooks');
var async = require('async');

function Renderable(View) {
  this.data = {};
  this.mode = 'main';
  this.view = {};

  if (typeof View === 'function') {
    this.view = new View();
  }

  this.render = function(cb) {
    // recursively render any Renderable objects inside this.data
    // this currently has one flaw, Renderable objects cannot be in nested objects,
    // or you need to render them manually
    var renders = [];
    var item;

    for (item in this.data) {
      // Intent of hasOwnProperty check is handled by constructor test.
      // noinspection JSUnfilteredForInLoop
      if (this.data[item].constructor.name === 'Renderable') {
        renders.push(function(item, next) {
          this.data[item].render(function(err, rendered) {
            if (!err) this.data[item] = rendered;
            next(err);
          }.bind(this));
        }.bind(this, item));
      }
    }

    async.parallel(
      renders,
      function(err) {
      if (err) {
        cb(err)
      }
      else {
        this.view.data(this.data).mode(this.mode).render(cb);
      }
    }.bind(this));
  }
}

for (var k in hooks) {
  // Per hooks module documentation
  // noinspection JSUnfilteredForInLoop
  Renderable[k] = Renderable.prototype[k] = hooks[k];
}

module.exports = Renderable;
