var User = Catwalk.Model('user').include({
  name: function () {
    return this.attr('name')
  },
  online: function () {
    return this.attr('online');
  }
});

// user_list.bind('add', function (m) {
//   results.push('Model added '+m.name())
// })
// 
// user_list.scope('johns', function (model) {
//   return /^joh/i.test(model.name());
// });
// 
// user_list.online.bind('add', function (m) {
//   results.push('User online '+m.name())
// }).bind('remove', function (m) {
//   results.push('Online user removed '+m.name())
// });
// 
// user_list.offline.bind('add', function (m) {
//   results.push('User offline '+m.name())
// }).bind('remove', function (m) {
//   results.push('Offline user removed '+m.name())
// })
// 
// // Bind to scope chains
// var chained_results = [];
// var chained_scope = user_list.scope('online').scope('johns').bind('add', function (m) {
//   chained_results.push('Chained model added '+m.name())
// }).bind('remove', function (m) {
//   chained_results.push('Chained model removed '+m.name())
// })



module('Scopes');

test('it should save in subscribed collections', function () {
  var scope = new Catwalk.Scope(User);
  var user = new User({name: 'ismael', online: true});
  equal(user, scope.last())
  equal(1, scope.size())
});

test('it should save in relevant scopes', function () {
  var scope = new Catwalk.Scope(User);
  var user = new User({name: 'ismael', online: true});
  
  scope.scope('online', function (model) {
    return model.online();
  });

  scope.scope('offline', function (model) {
    return !model.online();
  });
  
  var user = new User({name: 'ismael', online: true});
  
  equal(user, scope.online.last())
  equal(1, scope.online.size(), 'should add to one')
  equal(0, scope.offline.size(), 'should remove from another')
})

test('it should run attached handlers', function () {
  
  var scope = new Catwalk.Scope(User);
  
  scope.scope('online', function (model) {
    return model.online();
  });
  
  var results = [];
  scope.bind('add', function (m) {
    results.push('Model added '+m.name())
  })
  scope.online.bind('add', function (m) {
    results.push('User online '+m.name())
  })
  var user = new User({name: 'ismael', online: true});
  
  equal(results[0], 'Model added ismael')
  equal(results[1], 'User online ismael')
})

test('it should update all scopes when instance changes', function () {
  
  var scope = new Catwalk.Scope(User);
  
  scope.scope('online', function (model) {
    return model.online();
  });
  scope.scope('offline', function (model) {
    return !model.online();
  });
  
  var results = [];
  scope.bind('add', function (m) {
    results.push('Model added '+m.name())
  })
  scope.online.bind('add', function (m) {
    results.push('User online '+m.name())
  })
  var user = new User({name: 'ismael', online: true});
  
  user.attr('online', false);
  equal(0, scope.online.size());
  equal(1, scope.offline.size());
  equal(user, scope.offline.last())
})

test('it should chain scopes', function () {
  var scope = new Catwalk.Scope(User);
  
  scope.scope('online', function (model) {
    return model.online();
  });
  scope.scope('johns', function (model) {
    return /^joh/i.test(model.name());
  });
  // Bind to scope chains
  var chained_results = [];
  var chained_scope = scope.scope('online').scope('johns').bind('add', function (m) {
    chained_results.push('Chained model added '+m.name())
  }).bind('remove', function (m) {
    chained_results.push('Chained model removed '+m.name())
  })
  
  var u = new User({name: 'John', online: true});
  equal(1, chained_scope.size(), 'increments chained_scope count by 1');
  equal(u, chained_scope.last(), 'new model is in chained_scope collection');
  equal(chained_results[0], 'Chained model added John', 'appends to callback results');
  
  u.attr('name', 'Foo Bar');
  equal(0, chained_scope.size(), 'decrements chained_scope count by 1');
  equal(chained_results[1], 'Chained model removed Foo Bar', 'appends to callback results');
  
  // test that scope works standalone too
  var standalone_results = [];
  var standalone = scope.scope('johns').bind('add', function (model) {
    standalone_results.push('Standalone john added')
  })
  u.attr({name:'John', online: false});
  equal(1, standalone.size())
  equal(standalone_results[0], 'Standalone john added')
})

