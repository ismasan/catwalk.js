// Catwalk.Scope
// -----------------
//  Scopes define criteria to trigger 'add' or 'remove' models.
//  A scope defines a simple filter function that takes a model instance and must return a boolean.

//  ** Example: **
//  
//      var user_list = new Catwalk.Scope(User, function (model) {
//        return /^is/i.test(model.attr('name'))
//      })
//      var user = new User({name: 'ismael'}) 
//      // user_list triggers 'add' with this user
//      user.attr('name', 'john') 
//      // user_list triggers 'remove' with this user
//  

Catwalk.Scope = Class.setup(
  
  // binding and triggering of events
  //
  //     user_list.bind('add', function (model) {
  //       console.log('model matches this scope's criteria', model)
  //     })
  
  Catwalk.Events, 
  
  // Mixin Underscore's array methods
  array_methods_module,
  
  {
  // Constructor
  // ----------------
  // Instantiate a scope with anything that triggers 'add', 'change' or 'remove'. 
  // Normally a model constructor or even another scope.
  //
  //     var user_list = new Catwalk.Scope(User, function (model) {
  //       return /^is/i.test(model.attr('name'))
  //     })
  
  init: function (emitter, criteria, parent) {
    this.emitter = emitter;
    this._parent = parent;
    this.collection = [];
    this.criteria = criteria || function (model) {return true;}
    this._scopes = {};
    var self = this;
    var handler = function (model) {
      console.log('handling', model)
      self.update(model);
      return self;
    }
    // Bind to emitter's lifecycle events
    emitter.bind('add', handler).bind('remove', handler).bind('change', handler);
    // Retrospectively add previously created models to this scope.
    // The scope might have been created dinamically at a later stage so model instances might already be around.
    if(emitter.each) {
      emitter.each(function () {
        self.update(this);
      })
    }
    this.length = this.collection.length;
  },
  
  // A scope can create nested scopes, passing itself as the child scope's 'emitter'
  //
  //     user_list.scope('online', function (user) {
  //       return user.is_online == true;
  //     })
  //
  //     user_list.online.bind('add', function (user) {
  //       console.log('User online', user)  
  //     })
  //
  // You can also bind to nested scopes, in which case all criteria from all scopes in the chain must be TRUE
  // for  the chain to trigger 'add' when a model changes
  //
  //     user_list.scope('johns', function (m) {
  //       return /joh/i.test(m.attr('name'))  
  //     })
  //
  //     var chain = user_list.scope('online').scope('johns').bind('add', someHandler)
  //
  scope: function (scope_name, criteria) {
    var base = this._base();
    if(criteria == undefined) { // return scope
      return base._scopes[scope_name];
    } else { // create scope
      base._scopes[scope_name] = new Catwalk.Scope(this.emitter, criteria, this);
      this[scope_name] = base._scopes[scope_name];
      return this;
    }
  },
  
  // Look up the scope chain and return the "base" scope.
  // See chained scopes
  //
  _base: function () {
    return this._parent ? this._parent._base() : this;
  },
  
  // Notify this scope that a user has been instantiated, changed or removed
  update: function (model) {
    if(this.include(model)) {
      if(this._filter(model)) return this;
      this.remove(model);
    } else {
      if(!this._filter(model)) return this;
      this.add(model);
    }
  },
  
  // Add to internal collection and trigger 'add'
  add: function (model) {
    this.collection.push(model);
    this.length = this.collection.length;
    this.trigger('add', [model]);
    console.log('ADDING TO COLLECTION', this.foo, model, this.collection)
    return this;
  },
  
  // Remove from internal collection and trigger 'remove'
  remove: function (model) {
    var new_coll = [], removed = false;
    this.each(function (m) {
      if(!this.comparator(m, model)) new_coll.push(m)
      else {removed = true;}
    }, this);
    if(removed) {
      this.collection = new_coll;
      this.length = this.collection.length;
      this.trigger('remove', [model]);
    }
    return this;
  },
  
  // Lookup the scope chain and pass model to each filter
  // Return true if every criteria is true
  _filter: function (model) {
    if(!this.criteria(model)) return false;
    if(this._parent && !this._parent._filter(model)) return false;
    return true; 
  },
  
  // Default equality function. Overwrite this to implement your own model equality
  comparator: function (one, two) {
    return one == two;
  },
  
  pluck: function(attr) {
    return this.map(function (model) {return model.attr(attr)});
  },
  
  // Borrow Underscore.js' chain functionality.
  //
  //     user_list.chain().select(someFilter).value()
  //
  chain: function () {
    return _(this.collection).chain();
  }
});
