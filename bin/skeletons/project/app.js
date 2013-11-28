/**
 * Basic Turnpike app initializer.
 *
 * Starts the Turnpike event loop.
 *
 * DO NOT MODIFY THIS FILE!!!
 * If you do, then the behavior of your app will be inconsistent depending on how it was started,
 * which means you will not be able to use testdrive to reliably debug.
 *
 */
var turnpike = require('turnpike');

// Start the server
turnpike.drive();
