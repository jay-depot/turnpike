var hooks = require('hooks');
var _ = require('underscore');
var modelList = [];

function ModelBase() {
  //Item constructor.
  //Returns an empty Item as stored by this model.
  this.Item = this.Item || function() {
    this._id = undefined;
  };

  //Iterates through each item in [items].
  //For each one, fetches a collection of matching items from storage,
  //deduplicates the result set, and passes it into the second argument
  //to the [done] callback.
  this.fetch = this.fetch || function(items, done) {
    process.nextTick(function(){
      done(false, []);
    });
  };

  //Iterates through each item in [items].
  //For each one, saves it to storage, possibly assigning default values to
  //undefined properties. Passes the items as they look after saving into the
  //second argument to the [done] callback.
  this.save = this.save || function(items, done) {
    process.nextTick(function(){
      done(false, []);
    });
  };

  //Iterates through each item in [items].
  //For each one, deletes all matching items from storage.
  //Passes the elemens from [items] that matched anything for deletion into
  //the second argument to the [done] callback.
  this.erase = this.erase || function(items, done) {
    process.nextTick(function(){
      done(false, []);
    });
  }

  //Using the [item] parameter for sort ordering, returns up to [count] items
  //from storage, starting from [first] in the list.
  this.list = this.list || function(item, first, count, done) {
    process.nextTick(function(){
      done(false, []);
    });
  };

  //Returns a list of models this model references.
  //By convention, any item property that is capitalized, and matches the
  //name of a model is a reference to an item from that model
  this.joins = this.joins || _(function() {
    var joins = [];
    var item = new this.Item();
    var k;

    for (k in item) {
      if (k[0].toUpperCase() === k[0]) {
        if (_(modelList).findWhere({'name': k})) {
          joins.push(k);
        }
      }
    }

    return joins
  }).memoize();

  for (var k in hooks) {
    this[k] = hooks[k];
  }

  modelList.push({'name': k});
}

module.exports = ModelBase;
