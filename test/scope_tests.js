module('Scopes', {
  setup: function () {
    this.User = Catwalk.Model('user').include({
      name: function () {
        return this.attr('name')
      },
      online: function () {
        return this.attr('online');
      }
    });
    
    this.scope = new Catwalk.Scope(this.User);
  }
});

test('it should save in subscribed collections', function () {
  var user = new this.User({name: 'ismael', online: true});
  equal(user, this.scope.last())
  equal(1, this.scope.size())
});

test('it should save in relevant scopes', function () {
  var user = new this.User({name: 'ismael', online: true});
  
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
})

