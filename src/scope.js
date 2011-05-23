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
Catwalk.Scope = (function () {
  
  // Constructor
  // ----------------
  // Instantiate a scope with anything that triggers 'add', 'change' or 'remove'. 
  // Normally a model constructor or even another scope.
  //
  //     var user_list = new Catwalk.Scope(User, function (model) {
  //       return /^is/i.test(model.attr('name'))
  //     })
  
  function Scope (emitter, criteria) {
    this.emitter = emitter;
    this.collection = [];
    this.criteria = criteria || function (model) {return true;}
    this._scopes = {};
    var self = this;
    var handler = function (model) {
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
  }
  
  // Borrow array functional methods from underscore.js. No point in reinventing an already very round wheel.
  // http://documentcloud.github.com/underscore/docs/underscore.html
  
  var methods = ['forEach', 'each', 'map', 'reduce', 'reduceRight', 'find', 'detect',
      'filter', 'select', 'reject', 'every', 'all', 'some', 'any', 'include',
      'invoke', 'max', 'min', 'sortBy', 'sortedIndex', 'toArray', 'size',
      'first', 'rest', 'last', 'without', 'indexOf', 'lastIndexOf', 'isEmpty'];

  _.each(methods, function(method) {
    Scope.prototype[method] = function() {
      return _[method].apply(_, [this.collection].concat(_.toArray(arguments)));
    };
  });
  
  // Extend the constructor for things such as Scope.extend and Scope.include
  Base.extend.call(Scope, Base)
  
  // Instance methods
  // --------------------
  Scope.include(
    
    // binding and triggering of events
    //
    //     user_list.bind('add', function (model) {
    //       console.log('model matches this scope's criteria', model)
    //     })
    
    Catwalk.Events, {
    
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
    scope: function (scope_name, criteria) {
      if(criteria == undefined) { // return scope
        return this._scopes[scope_name];
      } else { // create scope
        this._scopes[scope_name] = new Scope(this.emitter, criteria);
        this[scope_name] = this._scopes[scope_name];
        return this;
      }
    },
    
    // Notify this scope that a user has been instantiated, changed or removed
    update: function (model) {
      if(this.include(model)) {
        if(this.criteria(model)) return this;
        this.remove(model);
      } else {
        if(!this.criteria(model)) return this;
        this.add(model);
      }
    },
    
    // Add to internal collection and trigger 'add'
    add: function (model) {
      this.collection.push(model);
      this.length = this.collection.length;
      this.trigger('add', [model]);
      
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
  
  return Scope;
  
  
  
})();