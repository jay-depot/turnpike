var domain = require('domain');
var cluster = require('cluster');

function domain_wrapper(server) {
  return function(req, res, next) {
    req.domain = domain.create();

    req.domain.on('error', function(er) {
      console.log(er.stack);
      try {
        var countdown = setTimeout(function(){
          process.exit(1);
        }, 30000);
        countdown.unref();
        server.close();
        cluster.worker.disconnect();

        res.writeHead(500, "Unknown fatal server error", {'Content-Type': 'text/plain'});
        res.end("500\nInternal server error.");
      }
      catch (er2) {
        console.error('Failure sending 500 status during error handler');
      }
    });

    req.domain.add(req);
    req.domain.add(res);

    req.domain.run(function() {
      next(false, req, res);
    });
  };
}
