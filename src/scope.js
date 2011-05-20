M.Scope = (function () {
  
  var klass = function (emitter_klass, filter, parent) {
    this.emitter_klass = emitter_klass;
    this.collection = [];
    this._parent = parent;
    this.filter = filter || function (model) {return true;}
    this.scopes = {};
    var self = this;
    if(this._parent) { // parent might already have models. Prepopulate
      this._parent.forEach(function (m) {
        self.add(m);
      })
    }
    this.emitter_klass.bind('remove', function (m) {
      self.remove(m);
    }).bind('add', function (m) {
      self.add(m);
    });
    
    this.length = this.collection.length;
  }
  
  klass.extend = function() {
    Base.extend.apply(this.prototype, arguments);
    return this;
  }
  klass.extend(Base, M.Events);
  
  // Instance methods
  klass.extend({
    
    scope: function (scope_name, filter) {
      if(filter == undefined) { // return scope
        return this.scopes[scope_name];
      } else { // create scope
        this.scopes[scope_name] = new klass(this, filter, this);
        this[scope_name] = this.scopes[scope_name];
        return this;
      }
    },
    
    add: function (model) {
      var is_included = this.includes(model), passes = this.filter(model);
      if(is_included && passes === false) { // doesn't match scope anymore, remove.
        this.remove(model)
        return this;
      } else if(is_included) { // already there
        return this;
      } else if(passes === false) { // not included but doesn't match scope, sorry!
        return this;
      }
      // Not included and matches scope. Add it!
      this.collection.push(model);
      this.length = this.collection.length;
      this.trigger('add', [model]);
      
      return this;
    },
    
    remove: function (model) {
      if(!this.includes(model)) return this;
      var new_coll = [], removed = false;
      this.collection.forEach(function (m) {
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
    
    first: function () {
      return this.collection[0];
    },
    
    last: function () {
      return this.collection[this.collection.length - 1];
    },
    
    all: function () {
      return this.detect(this.filter);
    },
    
    count: function () {
      return this.collection.length;
    },
    
    comparator: function (one, two) {
      return one == two;
    },
    
    forEach: function (iterator) {
      this.collection.forEach(iterator, this);
      return this;
    },
    
    detect: function (iterator) {
      var selected = [];
      this.forEach(function (model, i) {
        if(iterator(model, i)) selected.push(model);
      });
      return selected;
    },
    
    includes: function (model) {
      var found = false;
      this.forEach(function (m, i) {
        if (this.comparator(model, m)) found = true;
      });
      return found;
    }
    
  });
  
  return klass;
  
})();