var User = Catwalk.Model('user').include({
  name: function () {
    return this.attr('name')
  },
  online: function () {
    return this.attr('online');
  }
});

var results = [];

user_list = new Catwalk.Scope(User);

user_list.bind('add', function (m) {
  console.log('aaaaa',m.attributes ,m.attributes['name'])
  results.push('Model added '+m.name())
})

user_list.scope('online', function (model) {
  console.log('checking online')
  return model.online();
});

user_list.scope('offline', function (model) {
  console.log('checking offline')
  return !model.online();
});

user_list.online.bind('add', function (m) {
  results.push('User online '+m.name())
}).bind('remove', function (m) {
  results.push('Online user removed '+m.name())
});

user_list.offline.bind('add', function (m) {
  results.push('User offline '+m.name())
}).bind('remove', function (m) {
  results.push('Offline user removed '+m.name())
})

user = new User({name: 'ismael', online: true});

module('Saving', {
  setup: function () {
    
  }
});

test('it should save in subscribed collections', function () {
  equal(user, user_list.last())
  equal(1, user_list.size())
});

test('it should save in relevant scopes', function () {
  equal(user, user_list.online.last())
  equal(1, user_list.online.size())
})

test('it should not add to non-relevant scopes', function () {
  equal(0, user_list.offline.size())
})

test('it should run attached handlers', function () {
  equal(results[0], 'Model added ismael')
  equal(results[1], 'User online ismael')
})

test('it should update all scopes when instance changes', function () {
  user.attr('online', false);
  equal(0, user_list.online.size());
  equal(1, user_list.offline.size());
  equal(user, user_list.offline.last())
})