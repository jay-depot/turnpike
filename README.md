turnpike
========
[![Build Status](https://travis-ci.org/jay-depot/turnpike.png?branch=master)](https://travis-ci.org/jay-depot/turnpike)
[![Code Climate](https://codeclimate.com/github/jay-depot/turnpike.png)](https://codeclimate.com/github/jay-depot/turnpike)

A stylistically permissive, flexible HMVC framework for Node.js

Built on Connect, Hooks and Underscore, Turnpike aims to provide a similar productivity boost as other MVC frameworks that include code generators, but with the additional boost to code reusability that comes with the HMVC pattern. If you come from Rails or similar frameworks, you should find the transition to Turnpike reasonably painless. Developers coming from a framework like Kohana should feel at home, and might even learn to enjoy having code generators.

Features:
 - Hierachical page building. Every page region can be assgned its own MVC triad, which can then call down a tree of further MVC triads to build each page component.
 - Automatic view class building from folders full of templates. Just name your folder and the Jade templates inside correctly, and Turnpike does the rest.
 - Automatically manages worker processes for high availability and optimal performance in a multi-CPU production environment.
 - Rich pre/post hook system to give ample opportunities to alter the behavior of your app without needing to reinvent framework functions
 - Smart configuration system that automatically provides a fallback chain from Environment variables to project defaults and finally framework defaults.

Future Roadmap:
 - Base model classes to provide MongoDB and SQL based persistence with an interface very similar to ActiveRecord.
 - Session support
 - A form building API with CSRF protection (based on Connect, of course)
 - RESTful response format negotiation.
 - Automatic router endpoints based on controller names.

