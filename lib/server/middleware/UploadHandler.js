var multiparty   = require('multiparty');
var tmp          = require('./../../config').tmpdir;
var router       = require('./../Router');
var ActionParser = require('./../ActionParser');
var autoLoader   = require('./../../internal/autoLoader');
var async        = require('async');
var url          = require('url');

function UploadHandler() {
  return function(req, res, next) {
    async.waterfall([
      function(next){
        Router.resolve(next, url.parse(req.url).pathname);
      },

      function(route, next) {
        var action = route.controller;
        var controller;
        var http_method = req.method === "DELETE" ? "DEL" : req.method;
        var application = require('./../../index').application;

        if (typeof action !== "string") {
          action = action[http_method];
        }

        action = ActionParser.parse(action);

        if (typeof action === "string") {
          action = {
            'classname': action,
            'method': false,
            'instance': false
          };
        }

        controller = application.controllers[action.classname];
        if (action.instance) { controller = new controller(); }
        if (action.method) { controller = controller[action.method]; }

        next(false, controller.upload);
      },

      function(accept, next) {
        var form  = new multiparty.Form({'uploadDir': tmp});
        var last = {
          'req': req,
          'res': res
        };

        if (accept) {
          form.parse(req, function(err, fields, files) {
            if (!err) {
              for (var i in fields) {
                if (fields[i].length === 1) {
                  fields[i] = fields[i][0]
                }
              }
              last.req.body = fields;
              last.req.files = files;
            }

            next(err, last);
          });
        }
        else {
          next(false, last);
        }
      }
    ],function(err, last){
      next(err, last.req, last.res);
    });
  };
}

module.exports = UploadHandler;
