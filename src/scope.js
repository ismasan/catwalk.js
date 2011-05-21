Catwalk.Scope = (function () {
  
  
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
    emitter.bind('add', handler).bind('remove', handler).bind('change', handler);
    // Retrospective add
    if(emitter.each) {
      emitter.each(function () {
        self.update(this);
      })
    }
    this.length = this.collection.length;
  }
  
  var methods = ['forEach', 'each', 'map', 'reduce', 'reduceRight', 'find', 'detect',
      'filter', 'select', 'reject', 'every', 'all', 'some', 'any', 'include',
      'invoke', 'max', 'min', 'sortBy', 'sortedIndex', 'toArray', 'size',
      'first', 'rest', 'last', 'without', 'indexOf', 'lastIndexOf', 'isEmpty'];

  _.each(methods, function(method) {
    Scope.prototype[method] = function() {
      return _[method].apply(_, [this.collection].concat(_.toArray(arguments)));
    };
  });
  
  Base.extend.call(Scope, Base)
  
  // Instance methods
  Scope.include(Catwalk.Events, {
    
    scope: function (scope_name, criteria) {
      if(criteria == undefined) { // return scope
        return this._scopes[scope_name];
      } else { // create scope
        this._scopes[scope_name] = new Scope(this, criteria);
        this[scope_name] = this._scopes[scope_name];
        return this;
      }
    },
    
    update: function (model) {
      if(this.include(model)) {
        if(this.criteria(model)) return this;
        this.remove(model);
      } else {
        if(!this.criteria(model)) return this;
        this.add(model);
      }
    },
        
    add: function (model) {
      this.collection.push(model);
      this.length = this.collection.length;
      this.trigger('add', [model]);
      
      return this;
    },
    
    remove: function (model) {
      var new_coll = [], removed = false;
      this.each(function (m) {
        if(!this.comparator(m, model)) new_coll.push(m)
        else {removed = true;}
      });
      if(removed) {
        this.collection = new_coll;
        this.length = this.collection.length;
        this.trigger('remove', [model]);
      }
      return this;
    },
    
    comparator: function (one, two) {
      return one == two;
    },
    
    pluck: function(attr) {
      return this.map(function (model) {return model.attr(attr)});
    },
    
    chain: function () {
      return _(this.collection).chain();
    }
    
  });
  
  return Scope;
  
  
  
})();