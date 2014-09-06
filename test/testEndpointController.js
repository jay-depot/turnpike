/**
 * Tests the EndpointController class.
 */

var WebEndpointController = require('../lib/classes/base/controller/WebEndpointController');
var util = require('util');

function MockModel() {
  this.Item = function() {
    this._id = undefined;
    this.name = undefined;
  };

  this.fields = function() {
    return new this.Item();
  };

  this.create = function(data, cb) {
    if (typeof(data) === 'function') {
      cb = data;
      data = {};
    }

    data = new this.Item(data)
    cb(false, data);
  };

  this.load = function(data, cb) {
    cb(false, data);
  };

  this.save = function(data, cb) {
    data._id = 1;
    cb(false, data);
  };

  this.remove = function(data, cb) {
    cb(false, data._id);
  };

  this.find = function(data, cb) {
    cb(false, data);
  };

  this.index = function(data, skip, cb) {
    cb(false, data);
  };
}

function TestController(connection) {
  WebEndpointController.call(this, connection);
} util.inherits(TestController, WebEndpointController);


exports['test default create with no model defined'] = function(assert, done) {
  var controller = new TestController({
    req: {
      body: {
        'name': 'test'
      }
    },
    res: {},
    die: function(code) {
      assert.equal(code, 405, "connection should die with 405 status");
      done();
    }
  });

  controller.create(function() {
    assert.ok(false, "readyCallback should not fire on error condition");
    done();
  });
};


exports['test default create endpoint failure'] = function(assert, done) {
  var model = new MockModel();
  var controller;

  model.save = function(data, cb) {
    cb (new Error('Test error'));
  }

  controller = new TestController({
    req: {
      body: {
        'name': 'test'
      }
    },
    res: {},
    die: function(code) {
      assert.equal(code, 500, "connection should die with 500 status");
      done();
    }
  });

  controller.model = model;

  controller.create(function() {
    assert.ok(false, "readyCallback should not fire on error condition");
    done();
  });
};


exports['test default create endpoint success'] = function(assert, done) {
  var model = new MockModel();
  var controller;

  controller = new TestController({
    req: {
      body: {
        'name': 'test'
      }
    },
    res: {},
    die: function(code) {
      assert.ok(false, "connection should not die on success");
      done();
    }
  });

  controller.model = model;

  controller.create(function() {
    assert.equal(controller.data.name, 'test', 'data to be sent to view should match created item');
    done();
  });
};


exports['test default edit endpoint with no model defined'] = function(assert, done) {
  var controller = new TestController({
    req: {
      body: {
        'name': 'test'
      }
    },
    res: {},
    die: function(code) {
      assert.equal(code, 405, "connection should die with 405 status");
      done();
    }
  });

  controller.edit(function() {
    assert.ok(false, "readyCallback should not fire on error condition");
    done();
  });
};


exports['test default edit endpoint with nonexistant item'] = function(assert, done) {
  var model = new MockModel();
  var controller = new TestController({
    req: {
      body: {
        'name': 'test'
      }
    },
    res: {},
    die: function(code) {
      assert.equal(404, code, "connection should die with 404 status");
      done();
    },
    route:{
      params:{
        id:1
      }
    }
  });

  model.load = function(data, cb) {
    cb(false, null);
  };

  controller.model = model;

  controller.edit(function() {
    assert.ok(false, "readyCallback should not fire on error condition");
    done();
  });
};


exports['test default edit endpoint with error during load'] = function(assert, done) {
  var model = new MockModel();
  var controller = new TestController({
    req: {
      body: {
        'name': 'test'
      }
    },
    res: {},
    die: function(code) {
      assert.equal(500, code, "connection should die with 500 status");
      done();
    },
    route:{
      params:{
        id:1
      }
    }
  });

  model.load = function(data, cb) {
    cb(new Error('Test error'));
  };

  controller.model = model;

  controller.edit(function() {
    assert.ok(false, "readyCallback should not fire on error condition");
    done();
  });
};


exports['test default edit endpoint with error during save'] = function(assert, done) {
  var model = new MockModel();
  var controller = new TestController({
    req: {
      body: {
        'name': 'test'
      }
    },
    res: {},
    die: function(code) {
      assert.equal(500, code, "connection should die with 500 status");
      done();
    },
    route:{
      params:{
        id:1
      }
    }
  });

  model.save = function(data, cb) {
    cb(new Error('Test error'));
  };

  controller.model = model;

  controller.edit(function() {
    assert.ok(false, "readyCallback should not fire on error condition");
    done();
  });
};


exports['test default edit endpoint success'] = function(assert, done) {
  var model = new MockModel();
  var controller;

  controller = new TestController({
    req: {
      body: {
        'name': 'test'
      }
    },
    res: {},
    die: function(code) {
      assert.ok(false, "connection should not die on success");
      done();
    },
    route:{
      params:{
        id:1
      }
    }
  });

  controller.model = model;

  controller.edit(function() {
    assert.equal(controller.data.name, 'test', 'data to be sent to view should match created item');
    done();
  });
};


exports['test default index endpoint with no model defined'] = function(assert, done) {
  var controller = new TestController({
    req: {
      query: {
      }
    },
    res: {},
    die: function(code) {
      assert.equal(code, 405, "connection should die with 405 status");
      done();
    }
  });

  controller.edit(function() {
    assert.ok(false, "readyCallback should not fire on error condition");
    done();
  });
};


exports['test default index endpoint with error on retrieval'] = function(assert, done) {
  var model = new MockModel();
  var controller = new TestController({
    req: {
      query: {
        'name': 'test'
      }
    },
    res: {},
    die: function(code) {
      assert.equal(500, code, "connection should die with 500 status");
      done();
    },
    route:{
      params:{}
    }
  });

  model.index = function(data, skip, cb) {
    cb(new Error('Test error'));
  };

  controller.model = model;

  controller.index(function() {
    assert.ok(false, "readyCallback should not fire on error condition");
    done();
  });
};


exports['test default index endpoint success'] = function(assert, done) {
    var model = new MockModel();
  var controller = new TestController({
    req: {
      query: {
        'name': 'test'
      }
    },
    res: {},
    die: function(code) {
      assert.ok(false, "connection should not die on success");
      done();
    },
    route:{
      params:{}
    }
  });

  model.index = function(data, skip, cb) {
    assert.equal(data.name, 'test', 'parameters are sent to index method');
    assert.equal(skip, 0, 'skip parameter is sent correctly');
    cb(false, [{_id: 1, name: 'test'}]);
  };

  controller.model = model;

  controller.index(function() {
    assert.equal(controller.data.items.length, 1, 'returned list should have same number of items send back by model');
    done();
  });
};


exports['test default main endpoint with no model defined'] = function(assert, done) {
  var controller = new TestController({
    req: {
      query: {
      }
    },
    res: {},
    die: function(code) {
      assert.equal(code, 405, "connection should die with 405 status");
      done();
    },
    route:{
      params:{
        id:1
      }
    }
  });

  controller.main(function() {
    assert.ok(false, "readyCallback should not fire on error condition");
    done();
  });
};


exports['test default main endpoint with nonexistant item'] = function(assert, done) {
  var model = new MockModel();
  var controller = new TestController({
    req: {
      query: {
      }
    },
    res: {},
    die: function(code) {
      assert.equal(code, 404, "connection should die with 404 status");
      done();
    },
    route:{
      params:{
        id:1
      }
    }
  });

  model.load = function(data, cb) {
    cb(false, null);
  };

  controller.model = model;
  controller.main(function() {
    assert.ok(false, "readyCallback should not fire on error condition");
    done();
  });
};


exports['test default main endpoint with error on retrieval'] = function(assert, done) {
  var model = new MockModel();
  var controller = new TestController({
    req: {
      query: {
      }
    },
    res: {},
    die: function(code) {
      assert.equal(code, 500, "connection should die with 500 status");
      done();
    },
    route:{
      params:{
        id:1
      }
    }
  });

  model.load = function(data, cb) {
    cb(new Error('Test Error'));
  };

  controller.model = model;
  controller.main(function() {
    assert.ok(false, "readyCallback should not fire on error condition");
    done();
  });
};


exports['test default main endpoint success'] = function(assert, done) {
  var model = new MockModel();
  var controller = new TestController({
    req: {
      query: {
      }
    },
    res: {},
    die: function(code) {
      assert.ok(false, "connection should not die on success");
      done();
    },
    route:{
      params:{
        id:1
      }
    }
  });

  model.load = function(data, cb) {
    assert.equal(data._id, 1, 'correct id sent to load method');
    cb(false, {_id: 1, name: 'test'});
  };

  controller.model = model;

  controller.main(function() {
    assert.equal(controller.data.name, 'test', 'returned item should match item send back by model');
    done();
  });
};


exports['test default remove endpoint with no model defined'] = function(assert, done) {
  var controller = new TestController({
    req: {
      query: {
      }
    },
    res: {},
    die: function(code) {
      assert.equal(code, 405, "connection should die with 405 status");
      done();
    },
    route:{
      params:{
        id:1
      }
    }
  });

  controller.remove(function() {
    assert.ok(false, "readyCallback should not fire on error condition");
    done();
  });
};


exports['test default remove endpoint with nonexistant item'] = function(assert, done) {
  var model = new MockModel();
  var controller = new TestController({
    req: {
      query: {
      }
    },
    res: {},
    die: function(code) {
      assert.equal(code, 404, "connection should die with 404 status");
      done();
    },
    route:{
      params:{
        id:1
      }
    }
  });

  model.remove = function(data, cb) {
    cb(false, []);
  };

  controller.model = model;
  controller.remove(function() {
    assert.ok(false, "readyCallback should not fire on error condition");
    done();
  });
};


exports['test default remove endpoint with error on removal'] = function(assert, done) {
  var model = new MockModel();
  var controller = new TestController({
    req: {
      query: {
      }
    },
    res: {},
    die: function(code) {
      assert.equal(code, 500, "connection should die with 500 status");
      done();
    },
    route:{
      params:{
        id:1
      }
    }
  });

  model.remove = function(data, cb) {
    cb(new Error('Test Error'));
  };

  controller.model = model;
  controller.remove(function() {
    assert.ok(false, "readyCallback should not fire on error condition");
    done();
  });
};


exports['test default remove endpoint success'] = function(assert, done) {
  var model = new MockModel();
  var controller = new TestController({
    req: {
      query: {
      }
    },
    res: {},
    die: function(code) {
      assert.ok(false, "connection should not die on success");
      done();
    },
    route:{
      params:{
        id:1
      }
    }
  });

  model.remove = function(data, cb) {
    cb(false, [1]);
  };

  controller.model = model;
  controller.remove(function() {
    assert.equal(controller.data.removed[0], 1, 'list of removed items should contain item id from request');
    assert.equal(controller.data.removed.length, 1, 'list of removed items should contain exactly 1 item');
    done();
  });};


exports['test default removeForm endpoint with no model defined'] = function(assert, done) {
  var controller = new TestController({
    req: {
      query: {
      }
    },
    res: {},
    die: function(code) {
      assert.equal(code, 405, "connection should die with 405 status");
      done();
    },
    route:{
      params:{
        id:1
      }
    }
  });

  controller.removeForm(function() {
    assert.ok(false, "readyCallback should not fire on error condition");
    done();
  });
};


exports['test default removeForm endpoint with error on retrieval'] = function(assert, done) {
  var model = new MockModel();
  var controller = new TestController({
    req: {
      query: {
      }
    },
    res: {},
    die: function(code) {
      assert.equal(code, 500, "connection should die with 500 status");
      done();
    },
    route:{
      params:{
        id:1
      }
    }
  });

  model.load = function(data, cb) {
    cb(new Error('Test Error'));
  };

  controller.model = model;
  controller.removeForm(function() {
    assert.ok(false, "readyCallback should not fire on error condition");
    done();
  });
};


exports['test default removeForm endpoint with nonexistant item'] = function(assert, done) {
  var model = new MockModel();
  var controller = new TestController({
    req: {
      query: {
      }
    },
    res: {},
    die: function(code) {
      assert.equal(code, 404, "connection should die with 404 status");
      done();
    },
    route:{
      params:{
        id:1
      }
    }
  });

  model.load = function(data, cb) {
    cb(false, null);
  };

  controller.model = model;
  controller.removeForm(function() {
    assert.ok(false, "readyCallback should not fire on error condition");
    done();
  });
};


exports['test default removeForm endpoint with existing item'] = function(assert, done) {
  var model = new MockModel();
  var controller = new TestController({
    req: {
      query: {
      }
    },
    res: {},
    die: function(code) {
      assert.ok(false, "connection should not die on success");
      done();
    },
    route:{
      params:{
        id:1
      }
    }
  });

  model.load = function(data, cb) {
    assert.equal(data._id, 1, 'correct id sent to load method');
    cb(false, {_id: 1, name: 'test'});
  };

  controller.model = model;

  controller.removeForm(function() {
    assert.equal(controller.data.name, 'test', 'returned item should match item send back by model');
    done();
  });
};


exports['test default editForm endpoint with no model defined'] = function(assert, done) {
  var controller = new TestController({
    req: {
      query: {
      }
    },
    res: {},
    die: function(code) {
      assert.equal(code, 405, "connection should die with 405 status");
      done();
    },
    route:{
      params:{
        id:1
      }
    }
  });

  controller.editForm(function() {
    assert.ok(false, "readyCallback should not fire on error condition");
    done();
  });
};


exports['test default editForm endpoint with error on retrieval'] = function(assert, done) {
  var model = new MockModel();
  var controller = new TestController({
    req: {
      query: {
      }
    },
    res: {},
    die: function(code) {
      assert.equal(code, 500, "connection should die with 500 status");
      done();
    },
    route:{
      params:{
        id:1
      }
    }
  });

  model.load = function(data, cb) {
    cb(new Error('Test Error'));
  };

  controller.model = model;
  controller.editForm(function() {
    assert.ok(false, "readyCallback should not fire on error condition");
    done();
  });
};


exports['test default editForm endpoint with nonexistant item'] = function(assert, done) {
  var model = new MockModel();
  var controller = new TestController({
    req: {
      query: {
      }
    },
    res: {},
    die: function(code) {
      assert.equal(code, 404, "connection should die with 404 status");
      done();
    },
    route:{
      params:{
        id:1
      }
    }
  });

  model.load = function(data, cb) {
    cb(false, null);
  };

  controller.model = model;
  controller.editForm(function() {
    assert.ok(false, "readyCallback should not fire on error condition");
    done();
  });
};


exports['test default editForm endpoint with no item requested'] = function(assert, done) {
  var model = new MockModel();
  var controller = new TestController({
    req: {
      query: {
      }
    },
    res: {},
    die: function(code) {
      assert.ok(false, "connection should not die on success");
      done();
    },
    route:{
      params:{}
    }
  });

  controller.model = model;

  controller.editForm(function() {
    assert.deepEqual(controller.data, { _id: undefined, name: undefined }, "controller data should match empty model item");
    done();
  });
};


exports['test default editForm endpoint with existing item'] = function(assert, done) {
  var model = new MockModel();
  var controller = new TestController({
    req: {
      query: {
      }
    },
    res: {},
    die: function(code) {
      assert.ok(false, "connection should not die on success");
      done();
    },
    route:{
      params:{
        id:1
      }
    }
  });

  model.load = function(data, cb) {
    assert.equal(data._id, 1, 'correct id sent to load method');
    cb(false, {_id: 1, name: 'test'});
  };

  controller.model = model;

  controller.editForm(function() {
    assert.equal(controller.data.name, 'test', 'returned item should match item send back by model');
    done();
  });
};
