var cluster = require('cluster');

function getWorkerCount() {
  var count = 0;
  for (var worker in cluster.workers) if (cluster.workers.hasOwnProperty(worker)) {
    count++;
  }

  return count;
}

function processWrangler(minProcs, maxSpares, respawnDelay, cb) {
  var crashing = false;
  minProcs = minProcs || require('os').cpus().length;
  maxSpares = maxSpares || Math.ceil(minProcs /  2); //Still not
  respawnDelay = respawnDelay || 1000;

  console.log('Setting up workers.');

  cluster.on('fork', function(worker) {
    console.log('Created worker: ' + worker.id);
  });

  cluster.on('listening', function(worker) {

    if (getWorkerCount() < minProcs) {
      cluster.fork();
    }
    else {
      cb(false, getWorkerCount());
    }
  });

  cluster.on('disconnect', function(worker) {
    if (worker.suicide && !crashing) {
      console.error('Worker ' + worker.id + ' crashed!');
      console.log('Replacing crashed worker ' + worker.id + ' in ' +
        respawnDelay / 1000 +
        ' second(s).\n' + getWorkerCount() +
        ' functioning worker(s) until replacement spawns.');
      setTimeout(function(){ cluster.fork(); }, respawnDelay);
    }
    else if (!crashing) {
      var countdown = setTimeout(function(){
        process.exit(1);
      }, 30000);
      crashing = true;
      countdown.unref();
      console.error('Worker ' + worker.id + ' crashed hard without a domain catching it.');
      console.error('Usually this means it never even started listening for connections. ' +
        'Check output above for reasons this might be the case.');

      for (var w in cluster.workers) {
        w.disconnect()
      }
    }

    else {
      console.log('Worker ' + worker.id + ' down.');
    }
  });

  cluster.fork();
}

module.exports = processWrangler;
