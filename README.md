# turnpike
[![Build Status](https://travis-ci.org/jay-depot/turnpike.png?branch=master)](https://travis-ci.org/jay-depot/turnpike)
[![Code Climate](https://codeclimate.com/github/jay-depot/turnpike.png)](https://codeclimate.com/github/jay-depot/turnpike)

A stylistically permissive, flexible HMVC framework for Node.js

Built on Connect, Hooks and Underscore, Turnpike aims to provide a similar productivity boost as other MVC frameworks that include code generators, but with the additional boost to code reusability that comes with the HMVC pattern. If you come from Rails or similar frameworks, you should find the transition to Turnpike reasonably painless. Developers coming from a framework like Kohana should feel at home, and might even learn to enjoy having code generators. The main difference for these developers will be that a Turnpike server doesn't talk to itself over the network to handle the heirarchy.

## Features:
 - Hierachical page building. Every page region can be assgned its own MVC triad, which can then call down a tree of further MVC triads to build each page component. (note, this currently requires a bit of a kludge to get the partials to come back up the triad, rather than try and fail to deliver over the connection. This will be fixed soon.)
 - Automatic view class building from folders full of templates. Just name your folder and the Jade templates inside correctly, and Turnpike does the rest.
 - Automatically manages worker processes for high availability and optimal performance in a multi-CPU production environment.
 - Rich pre/post hook system to give ample opportunities to alter the behavior of your app without needing to reinvent framework functions
 - Smart configuration system that automatically provides a fallback chain from Environment variables to project defaults and finally framework defaults.
 - Access control rules are automatically loaded from a separate module than the controller providing the endpoints being secured. This provides a nice, natural separation of concerns for access rules.
 - RESTful response format negotiation. Built-in support for HTML, and JSON responses, which are automatically negotiated based on the Accept header from the client. Adding additional formats is done on a per-controller basis (project-wide is coming soon) and is very straightforward.

## Future Roadmap:
 - Base model classes to provide MongoDB and SQL based persistence with an interface very similar to ActiveRecord.
 - Session support
 - A form building API with CSRF protection (based on Connect, of course)
 - Automatic router endpoints based on controller names.

## Getting started
```bash
$ npm install -g turnpike
$ turnpike create project Turnpike Example
$ cd turnpike-example
$ npm init
$ npm install
$ turnpike testdrive
```
Then just visit http://localhost:1337

## Contributing
Contributions are always welcome. The most useful contribution is simply grabbing the framework, playing with it and giving suggestions for what it needs to be complete. Aside from that, documentation and tests are probably the biggest needs.
