/**
 * Turnpike plumbing.
 *
 * On-the-fly creation and caching of model objects with automated garbage
 * collection.
 *
 * Model classes currently cannot take any arguments in their constructor for
 * this to work. Obviously all methods in the model class need to be reentrant
 * as the event loop could very easily call any of your methods any number of
 * times while already in the midst of handling a CRUD request.
 *
 * Under this system, persistent model objects aren't manipulated directly by
 * controllers. Instead, they communicate with controllers by way of data item
 * objects. We don't need a constructor for data items because there are no
 * invariant fields they are expected to have. Their structure depends entirely
 * on the data you will be storing.
 *
 * @constructor
 */

function ModelPool() {
  this._pool = {};
  this._registry = {};

  this.instantiate(name) {
    this._pool[name] = {};
    this._pool[name].model   = new this._registry[name]();
    console.log('Instantiating and cacheing model: ' + name);
  }

  this.register = function(name, modelClass) {
    this._registry[name] = modelClass;
    this.instantiate(name);
  };

  this.retrieve = function(name) {
    var pool = this;

    if (!this._registry[name]) return false;

    if (!this._pool[name]) {
      this.instantiate(name);
    }

    return this._pool[name].model;
  };

  this.destroy = function(name) {
    console.log('Destroying cached model: ' + name);
    return delete this._pool[name];
  };
}

module.exports = ModelPool;
