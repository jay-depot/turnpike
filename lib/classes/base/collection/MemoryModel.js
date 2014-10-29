/**
 * Base model class for storing in process memory.
 * Not directly useful in production environments. Storage here will only work
 * if there is only one worker process. i.e. running with # turnpike testdrive
 *
 * Mostly meant to be a reference implementation.
 *
 * May also be useful as a caching wrapper around a more permanent and shared
 * form of storage as long as the datasets are VERY small, but I make no
 * guarantees, as nothing about this is designed to be fast.
 */

var util = require('util');
var ModelBase = require('./CollectionBase');
var _ = require('underscore');

function MemoryModel() {
  var storage = [];
  var lastID = 0;

  console.warn("WARNING: You are using MemoryModel as the base for " + this.constructor.name);
  console.warn("Do not use this in a production environment! It is slow, leaks memory, " +
    "and does not scale across processes or servers.");

  function findLike(items) {
    var k, result = [];
    for (k in items) {
      (function() {
        var item = items[k];
        var partial, prop;

        for (prop in item) {
          if (item[prop] === undefined) {
            delete(item[prop]);
          }
        }

        partial = _(storage).where(item);
        result = _(result).union(partial);
      })();
    }

    return result;
  }

  //Item constructor.
  //Returns an empty Item as stored by this model.
  this.Item = this.Item || function Item() {
    this._id = undefined;
  };

  //Iterates through each item in [items].
  //For each one, fetches a collection of matching items from storage,
  //deduplicates the result set, and passes it into the second argument
  //to the [done] callback.
  this.fetch = this.fetch || function(items, done) {
    process.nextTick(function() {
      done(false, findLike(items));
    });
  };

  //Iterates through each item in [items].
  //For each one, saves it to storage, possibly assigning default values to
  //undefined properties. Passes the items as they look after saving into the
  //second argument to the [done] callback.
  this.save = this.save || function(items, done) {
    var k, result = [];

    storage = _(storage).indexBy('_id');

    for (k in items) {
      if (items[k]._id) {
        storage[_id] = items[k];
      }
      else {
        items[k]._id = ++lastID;
        storage[lastID] = items[k];
      }

      result.push(items[k]);
    }

    process.nextTick(function() {
      done(false, result);
    });
  };

  //Iterates through each item in [items].
  //For each one, deletes all matching items from storage.
  //Passes the elements from [items] that matched anything for deletion into
  //the second argument to the [done] callback.
  this.erase = this.erase || function(items, done) {
    var k, result = [];

    items = findLike(items);
    storage = _(storage).indexBy('_id');

    for (k in items) {
      delete(storage[items[k]._id]);
    }

    process.nextTick(function() {
      done(false, items);
    });
  }

  //Using the [item] parameter for sort ordering, returns up to [count] items
  //from storage, starting from [first] in the list.
  this.list = this.list || function(item, first, count, done) {
    process.nextTick(function() {
      done(false, []);
    });
  };

  ModelBase.call(this);
} util.inherits(MemoryModel, ModelBase);


module.exports = MemoryModel;
