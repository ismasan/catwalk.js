var User = Catwalk.Model('user').include({
  name: function () {
    return this.attr('name')
  }
});

var results = [];


UserList = new Catwalk.Scope(User);

UserList.bind('add', function (m) {
  results.push('Model added '+m.name())
})

UserList.scope('marks', function (model) {
  return model.name() == 'mark';
});

UserList.scope('ismaels', function (model) {
  return model.name() == 'ismael';
});

UserList.marks.bind('add', function (m) {
  results.push('Mark added '+m.name())
}).bind('remove', function (m) {
  results.push('Mark removed '+m.name())
});

UserList.ismaels.bind('add', function (m) {
  results.push('Ismael added '+m.name())
}).bind('remove', function (m) {
  results.push('Ismael removed '+m.name())
})

user = new User({name: 'ismael'}).save();

module('Saving', {
  setup: function () {
    
  }
});

test('it should save in subscribed collections', function () {
  console.log('aaaaaaaaaa', UserList.collection)
  equal(user, UserList.last())
  equal(1, UserList.length)
});

test('it should save in relevant scopes', function () {
  equal(user, UserList.ismaels.last())
  equal(1, UserList.ismaels.length)
})

test('it should not add to non-relevant scopes', function () {
  equal(0, UserList.marks.length)
})

test('it should run attached handlers', function () {
  equal(results[0], 'Model added ismael')
  equal(results[1], 'Ismael added ismael')
})