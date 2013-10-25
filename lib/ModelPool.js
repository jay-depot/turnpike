/**
 * On-the-fly creation and caching of model objects with automated garbage
 * collection.
 *
 * Model classes currently cannot take any arguments in their constructor for
 * this to work. Obviously all methods in the model class need to be reentrant
 * as the event loop could very easily call any of your methods any number of
 * times while already in the midst of handling a CRUD request.
 *
 * @constructor
 */

function ModelPool() {
  this._pool = {};
  this._registry = {};

  this.registerModel = function(name, modelClass) {
    this._registry[name] = modelClass;
  };

  this.modelRetrieve = function(name) {
    var pool = this;

    if (!this._registry[name]) return false;

    if (this._pool[name]) {
      clearTimeout(this._pool[name].cleanup);
    }
    else {
      this._pool[name] = {};
      this._pool[name].model   = new this._registry[name]();
    }

    this._pool[name].cleanup = setTimeout(function(){
      pool.modelDestroy(name);
    }, 300000);

    return this._pool[name].model;
  };

  this.modelDestroy = function(name) {
    return delete this._pool[name];
  };
}

module.exports.ModelPool = ModelPool;
