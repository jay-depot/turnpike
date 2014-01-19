var hooks = require('hooks');

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

  for (var k in hooks) {
    this[k] = hooks[k];
  }
}
