/**
 * Turnpike.JS
 *
 * A lightweight and politely opinionated HMVC framework for Node.js. Turnpike can be used as a traditional
 * framework, with code generation and rapid deployment, or invoked as a library for more obscure use cases.
 *
 * Within the framework, some elements will be documented as "plumbing". If you are using Turnpike as a rapid
 * deployment framework, then these should be treated as the internal workings of the Turnpike "black box".
 * You shouldn't need or want to use or call any of the plumbing yourself.
 * If you are using Turnpike as a library, you will probably need use use a good deal of the plumbing directly.
 * If you do this, that's fine, but be aware that continuing development of the Turnpike framework may radically
 * alter the plumbing interfaces at any time, even between minor versions and revisions.
 *
 * Other elements of the framework are documented as "porcelain". These are the entry points to the framework we
 * expect any app relying on Turnpike to use. In general, after the 0.1.0 release, we will aim to maintain the
 * existing plumbing interfaces with few to no changes without a bump in the major version number.
 */

var turnpike = {},
    _        = require('underscore');

//Setup Underscore.js with Underscore String.
_.str = require('underscore.string');
_.mixin(_.str.exports());
_.str.include('Underscore.string', 'string'); // => true

//Porcelain interfaces:
turnpike.EndpointController = require('./lib/EndpointController');
turnpike.MemoryModel        = require('./lib/MemoryModel');
turnpike.KnexModel          = require('./lib/KnexModel');
turnpike.routes             = require('./lib/Router').routes;
turnpike.drive              = require('./lib/Drive').drive;
turnpike.Driver             = require('./lib/Drive').Driver;
turnpike.invoke             = require('./lib/AutoLoader').invoke;
turnpike.invokeModel        = require('./lib/AutoLoader').invokeModel;
turnpike.invokeView         = require('./lib/AutoLoader').invokeView;
turnpike.invokeController   = require('./lib/AutoLoader').invokeController;
turnpike.GlobalConfig       = require('./lib/GlobalConfig');
turnpike.ViewBase           = require('./lib/ViewBase');
turnpike.setSessionStorage  = require('./lib/Session').setSessionStorage;
turnpike.useCsrf            = require('./lib/Session').useCsrf;

//Plumbing interfaces:
turnpike.AutoLoader         = require('./lib/AutoLoader'); //Probes your project for its components. Supports an override heirarchy.
turnpike.ModelPool          = require('./lib/ModelPool'); //AutoLoader uses this to find model instances
turnpike.Connection         = require('./lib/Connection'); //Your controllers get instances of this
turnpike.ActionParser       = require('./lib/ActionParser'); //Turnpike server uses this to choose contoller actions from your routes.json file
turnpike.AccessControl      = require('./lib/AccessControl'); //Used by Turnpike Server to parse access rules
turnpike.Router             = require('./lib/Router'); //It's a router. 'nuff said.
turnpike.ViewBuilder        = require('./lib/ViewBuilder'); //Constructs View classes from a folder full of Jade templates
turnpike.server             = require('./lib/turnpike_server'); //The meat of what we pass to Connect for handling incoming requests.
turnpike.Session            = require('./lib/Session');

//nice to have:
turnpike._                  = _;

module.exports = turnpike;
