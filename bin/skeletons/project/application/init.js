/**
 * @file init.js
 * Custom initialization for your app. Use this space to attach any pre/post
 * hooks your setup will need.
 */

var turnpike = require('turnpike');

// This hook lets you attach your own middleware to Turnpike's Connect object.
turnpike.Driver.pre('startServer', function(next, app, cb){


  next(app, cb);
});

