module('Saving', {
  setup: function () {
    
    
    var User = Modelling.Model('user').extend({
      name: function () {
        return this.attr('name')
      }
    })


    var UserList = new Modelling.Collection(User);

    UserList.scope('marks', function (model) {
      return model.name() == 'mark';
    });

    UserList.scope('ismaels', function (model) {
      return model.name() == 'ismael';
    });

    UserList.bind('add', function (m) {
      console.log('Model added', m)
    })

    UserList.marks.bind('add', function (m) {
      console.log('mark added', m)
    }).bind('remove', function (m) {
      console.log('mark removed', m)
    });

    UserList.ismaels.bind('add', function (m) {
      console.log('ismael added', m)
    }).bind('remove', function (m) {
      console.log('ismael removed', m)
    })

    l = UserList;
    u = new User({name: 'ismael'}).save();
    
  }
});

test('it should save in subscribed collections', function () {
  equal(u, l.last())
  
});