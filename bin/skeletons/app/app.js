/**
 * Basic Turnpike app initializer.
 *
 * Reads the routes.json and config.json files, bootstraps Turnpike, sets up routes with associated
 * controllers and starts the Turnpike event loop.
 *
 */
var turnpike = require('turnpike');

turnpike.configure(JSON.parse(require('./config.json')));
turnpike.routes(JSON.parse(require('./routes.json')));

// Start the server
turnpike.drive();
