Catwalk.log = function () {
  console.log(Array.prototype.slice.call(arguments,0));
}

module('Scopes', {
  setup: function () {
    this.User = User = Catwalk.Model.setup({
      name: function () {
        return this.attr('name')
      },
      online: function () {
        return this.attr('online');
      }
    });
    
    this.scope = scope = new Catwalk.Scope(this.User);
  }
});

test('it should save in subscribed collections', function () {
  var user = new this.User({name: 'ismael', online: true});
  equal(user, this.scope.last())
  equal(1, this.scope.size())
});

test('it should populate from previous instances', function () {
  var user = new this.User({name: 'ismael', online: true});
  var another_scope = new Catwalk.Scope(this.User);
  equal(user, another_scope.last())
});

test('it should save in relevant scopes', function () {
  // var user = new this.User({name: 'ismael', online: true});
  
  this.scope.scope('online', function (model) {
    return model.online();
  });

  this.scope.scope('offline', function (model) {
    return !model.online();
  });
  
  var user = new this.User({name: 'ismael', online: true});
  
  equal(user, this.scope.online.last())
  equal(1, this.scope.online.size(), 'should add to one')
  equal(0, this.scope.offline.size(), 'should remove from another')
})

test('it should run attached handlers', function () {
  
  this.scope.scope('online', function (model) {
    return model.online();
  });
  
  var results = [];
  this.scope.bind('add', function (m) {
    results.push('Model added '+m.name())
  })
  this.scope.online.bind('add', function (m) {
    results.push('User online '+m.name())
  })
  var user = new this.User({name: 'ismael', online: true});
  
  equal(results[0], 'Model added ismael')
  equal(results[1], 'User online ismael')
})

test('it should update all scopes when instance changes', function () {
  
  this.scope.scope('online', function (model) {
    return model.online();
  });
  this.scope.scope('offline', function (model) {
    return !model.online();
  });
  
  var results = [];
  this.scope.bind('add', function (m) {
    results.push('Model added '+m.name())
  })
  this.scope.online.bind('add', function (m) {
    results.push('User online '+m.name())
  })
  var user = new this.User({name: 'ismael', online: true});
  
  user.attr('online', false);
  equal(0, this.scope.online.size());
  equal(1, this.scope.offline.size());
  equal(user, this.scope.offline.last())
})

test('it should chain scopes', function () {
  
  this.scope.scope('online', function (model) {
    return model.online();
  });
  this.scope.scope('johns', function (model) {
    return /^joh/i.test(model.name());
  });
  // Bind to scope chains
  var chained_results = [];
  var chained_scope = this.scope.scope('online').scope('johns').bind('add', function (m) {
    chained_results.push('Chained model added '+m.name())
  }).bind('remove', function (m) {
    chained_results.push('Chained model removed '+m.name())
  })
  
  var u = new this.User({name: 'John', online: true});
  equal(1, chained_scope.size(), 'increments chained_scope count by 1');
  equal(u, chained_scope.last(), 'new model is in chained_scope collection');
  equal(chained_results[0], 'Chained model added John', 'appends to callback results');
  
  u.attr('name', 'Foo Bar');
  equal(0, chained_scope.size(), 'decrements chained_scope count by 1');
  equal(chained_results[1], 'Chained model removed Foo Bar', 'appends to callback results');
  
  // test that scope works standalone too
  var standalone_results = [];
  var standalone = this.scope.scope('johns').bind('add', function (model) {
    standalone_results.push('Standalone john added')
  })
  u.attr({name:'John', online: false});
  equal(1, standalone.size())
  equal(standalone_results[0], 'Standalone john added')
});
// testName, expected, callback, async
test('it should run before_add guards', function () {
  var FailAdd = Catwalk.Scope.setup({
    beforeAdd: function (add_callback) {
      // do nothing
    }
  });
  var DeferredAdd = Catwalk.Scope.setup({
    beforeAdd: function (add_callback) {
      add_callback();
    }
  });
  
  var failed = new FailAdd(this.User);
  var successful = new DeferredAdd(this.User);
  
  var user = new this.User({name: 'ismael'});
  equal(user, successful.last());
  equal(1, successful.size());
  
  equal(undefined, failed.last());
  equal(0, failed.size());
  
});

module('REST Scopes', {
  setup: function () {
    this.User = User = Catwalk.Model.setup({
      destroy: function () {
        this._destroying = true;
        this._trigger('remove');
        return this;
      }
    });
    
    this.REST = new Catwalk.RestScope(this.User).config({
      resource_url: '/users',
      content_type: 'application/json'
    });
    
    
  }
});

test('it should POST serialized JSON to server on change', function () {
  var changed = false;
  
  var server = this.sandbox.useFakeServer();
  server.respondWith("POST", "/users",
                         [200, { "Content-Type": "application/json" },
                          '{ "name": "Hello World", "id": 123 }']);
                          
  var user = new this.User({some_bool: true});
  
  user.bind('change', function () {
    changed = true;
  })
  
  var rest = this.REST;
  
  // test request
  equal(1, server.requests.length);
  equal(server.requests[0].requestBody, JSON.stringify({some_bool: true}));
  equal('application/json;charset=utf-8', server.requests[0].requestHeaders['Content-Type']);
  
  // test response
  server.respond();
  equal('application/json', server.requests[0].responseHeaders['Content-Type']);
  
  equal('Hello World', user.attr('name'));
  equal(123, user.attr('id'));
  ok(changed);
  
});

test('it should PUT serialized JSON if model has an ID', function () {
  var server = this.sandbox.useFakeServer();
  var rest = this.REST;
  
  server.respondWith("PUT", "/users/123",
                         [200, { "Content-Type": "application/json" },
                          "{\"some_bool\":false,\"name\":\"Hello World\",\"id\":123}"]);

                          
                          
  var user = new this.User({some_bool: false, id: 123});
  
  // test request
  equal(1, server.requests.length);
  equal(server.requests[0].requestBody, JSON.stringify({some_bool: false, name:'Hello World',id:123}));
  equal('application/json;charset=utf-8', server.requests[0].requestHeaders['Content-Type']);
  
  // test response
  server.respond();
  equal('application/json', server.requests[0].responseHeaders['Content-Type']);
  
});



