/**
 * The Turnpike.drive() function. After everything is set up, this starts the Turnpike server.
 */

var http = require('http');
var Connection = require('./Connection');
var Router = require('./Router');
var url = require('url');
var GlobalConfig = require('./GlobalConfig');
var Cluster = require('cluster');

var drive = function() {
  if(Cluster.isMaster()) {
    var workers = require('os').cpus().length + 3;
    console.log('Setting up workers.');

    cluster.on('fork', function(worker){
      console.log('Created worker: ' + worker.id);
    });

    cluster.on('disconnect', function(worker){
      console.error('Worker ' + worker.id + ' crashed!');
      console.log('Replacing crashed worker ' + worker.id + ' in 10 seconds.');
      setTimeout(function(){ cluster.fork(); }, 10000);
    });

    for (var i = 0; i < workers; i++) {
      cluster.fork();
    }
    console.log('=== ' + workers + ' workers are now driving on the Turnpike! ===');
  }
  else {
    var domain = require('domain');

    var server = http.createServer(function(req, res) {
      var d = domain.create();

      d.on('error', function(er){
        console.error('Error encountered in connection handler', er.stack);
        try {
          var countdown = setTimeout(function(){
            process.exit(1);
          }, 30000);
          countdown.unref();
          server.close();
          cluser.worker.disconnect();
          res.statusCode = 500;
          res.setHeader('content-type', 'text/plain');
          res.end('Internal server error.\nThere was a problem handing your request.');
        }
        catch (er2) {
          console.error('Failure sending 500 status during error handler'. er.stack);
        }
      });

      d.add(req);
      d.add(res);
      d.run(function(){
        var connection = new Connection(req, res);
        connection.end(function() {
          connection.route = Router.resolve(url.parse(req.url).pathname);
          var controller = connection.route.controller;
          controller = new controller(connection);
          controller.prepare(controller.deliver);
        });
      });
    }).listen(GlobalConfig.port);
  }
};

module.exports = drive;
