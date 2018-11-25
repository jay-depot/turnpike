# turnpike
[![Build Status](https://travis-ci.org/jay-depot/turnpike.png?branch=master)](https://travis-ci.org/jay-depot/turnpike)
[![Code Climate](https://codeclimate.com/github/jay-depot/turnpike.png)](https://codeclimate.com/github/jay-depot/turnpike)
[![Test Coverage](https://codeclimate.com/github/jay-depot/turnpike/badges/coverage.svg)](https://codeclimate.com/github/jay-depot/turnpike/coverage)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fjay-depot%2Fturnpike.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fjay-depot%2Fturnpike?ref=badge_shield)

A stylistically permissive, flexible MVC framework for Node.js

Built on Express, Turnpike aims to provide a similar productivity boost as other MVC frameworks that include code generators. Developers coming from Rails or Symfony should find many of the idioms familiar.

## Features:
 - Automatically manages worker processes for high availability and optimal performance in a multi-CPU production environment.
 - Rich pre/post hook system to give ample opportunities to alter the behavior of your app without needing to reinvent framework functions
 - Smart configuration system that automatically provides a fallback chain from Environment variables to project defaults and finally framework defaults.
 - Access control rules are loaded from a separate module than the controller providing the endpoints being secured. This provides a nice, natural separation of concerns for access rules.
 - RESTful response format negotiation. Built-in support for HTML, and JSON responses, which are automatically negotiated based on the Accept header from the client. Adding additional formats is done on a per-controller basis (project-wide is coming soon) and is very straightforward.
 - Optional session API, if you like serving HTML pages, set up using Connect, you just need to pick a storage engine and pass it into one method call.
 - Useful session extensions, like attaching messages for the user
 - Command line tools for stub generation, route verification
 - A model layer based on persistent state, and dispatching actions. If you've worked with react/redux on the front-end, then Turnpike should look very familiar.

## Future Roadmap:
 - Plug-in API
 - Multipart file uploads made easy.
 - Compile back-end templates into front-end Javascript code.
 - Pluggable template engines
 - Simplify new project generation and setup down to one or two commands.

## Getting started
```bash
$ npm install -g turnpike
$ turnpike create project Turnpike Example
$ cd turnpike-example
$ npm install
$ turnpike testdrive
```
Then just visit http://localhost:1337

## Contributing
See CONTRIBUTING.md

## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fjay-depot%2Fturnpike.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fjay-depot%2Fturnpike?ref=badge_large)
