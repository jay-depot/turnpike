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

var turnpike = {};

// The big redo:
turnpike.application = require('./lib/application');
turnpike.classes     = require('./lib/classes');
turnpike.imports     = require('./lib/imports');
turnpike.internal    = require('./lib/internal');
turnpike.server      = require('./lib/server');
turnpike.util        = require('./lib/util');
turnpike.config      = require('./lib/config');

//Legacy interfaces:
//Porcelain interfaces:
turnpike.EndpointController = require('./lib/classes/base/controller/EndpointController');
turnpike.routes             = require('./lib/server/Router').routes;
turnpike.drive              = require('./lib/server/drive').drive;
turnpike.Driver             = require('./lib/server/drive').Driver;
turnpike.invoke             = require('./lib/internal/AutoLoader').invoke;
turnpike.invokeModel        = require('./lib/internal/AutoLoader').invokeModel;
turnpike.invokeView         = require('./lib/internal/AutoLoader').invokeView;
turnpike.invokeController   = require('./lib/internal/AutoLoader').invokeController;
turnpike.ViewBase           = require('./lib/classes/base/view/ViewBase');
turnpike.setSessionStorage  = require('./lib/server/middleware/SessionWrapper').setSessionStorage;
turnpike.useCsrf            = require('./lib/server/middleware/SessionWrapper').useCsrf;
turnpike.fieldMap           = require('./lib/classes/base/controller/fieldMap.js');

//Plumbing interfaces:
turnpike.ModelPool          = require('./lib/internal/ModelPool'); //AutoLoader uses this to find model instances
turnpike.Connection         = require('./lib/classes/Connection'); //Your controllers get instances of this
turnpike.ActionParser       = require('./lib/server/ActionParser'); //Turnpike server uses this to choose contoller actions from your routes.json file
turnpike.AccessControl      = require('./lib/server/AccessControl'); //Used by Turnpike Server to parse access rules
turnpike.Router             = require('./lib/server/Router'); //It's a router. 'nuff said.
turnpike.ViewBuilder        = require('./lib/classes/base/view/ViewBuilder'); //Constructs View classes from a folder full of Jade templates
turnpike.server             = require('./lib/server/turnpike_server'); //The meat of what we pass to Connect for handling incoming requests.
turnpike.Session            = require('./lib/server/middleware/SessionWrapper');

//nice to have:
turnpike._                  = turnpike.imports.underscore;
turnpike.connect            = turnpike.imports.connect; //returns the exact version of connect framework Turnpike is using.
                                                        //VERY helpful when setting up session storage in your app.

module.exports = turnpike;
