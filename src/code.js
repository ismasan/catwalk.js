function _extend () {
  var args = Array.prototype.slice.call(arguments,0);
  var a = args.shift();
  for(var i = 0;i<args.length;i++) {
    var b = args[i];
    for(var o in b) {
      a[o] = b[o]
    }
  }
  return a;
}

function NewUUID(){
  return Math.uuid(24, 16).toLowerCase();
}

var Base = {
  extend: function () {
    var args = Array.prototype.slice.call(arguments,0);
    args.unshift(this)
    return _extend.apply(this, args);
  }
}

var Events = {
  
  event_stack: function (evt_name) {
    this._events = this._events || {};
    this._events[evt_name] = this._events[evt_name] || [];
    return this._events[evt_name];
  },
  
  bind: function (evt_name, handler) {
    this.event_stack(evt_name).push(handler);
    return this;
  },
  
  trigger: function (evt_name) {
    var args = arguments[1] || [];
    var stack = this.event_stack(evt_name);
    for(var i = 0;i<stack.length;i++) {
      stack[i].apply(this, args);
    }
    return this;
  } 
}

var Model = function (klass_name) {
  Model[klass_name] = function () {
    this.uid = NewUUID();
    this.attributes = {};
    if(arguments.length > 0) this.attr(arguments[0])
  }
  
  var klass = Model[klass_name];
  
  klass._name = klass_name;
  
  klass.extend = function() {
    Base.extend.apply(klass.prototype, arguments);
    return this;
  }

  _extend(klass, Events);
  
  klass.extend(Base, Events);
  
  // Instance methods
  klass.extend({
    
    id: function () {
      return this.uid;
    },
    
    attr: function () {
      if(arguments.length == 0) { // return all attributes
        return this.attributes
      } else if(arguments.length == 1) { 
        if(typeof(arguments[0]) == 'string') // read one
          return this.attributes[arguments[0]];
        else  {// set many
          _extend(this.attributes, arguments[0]);
          return this;
        }
      } else {
        this.attributes[arguments[0]] = arguments[1];
      }
    },
    
    destroy: function () {
      this.trigger('remove');
      this.constructor.trigger('remove', [this]);
      return this;
    },
    
    save: function () {
      this.trigger('add');
      this.constructor.trigger('add', [this]);
      return this;
    }
  });
  
  return klass;
}

var Collection = (function () {
  
  var Collection = function (emitter_klass, filter, parent) {
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
  
  Collection.extend = function() {
    Base.extend.apply(this.prototype, arguments);
    return this;
  }
  Collection.extend(Base, Events);
  
  // Instance methods
  Collection.extend({
    
    scope: function (scope_name, filter) {
      if(filter == undefined) { // return scope
        return this.scopes[scope_name];
      } else { // create scope
        this.scopes[scope_name] = new Collection(this, filter, this);
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
      this.collection.forEach(iterator);
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
  
  return Collection;
  
})();

REST = function (emitter_klass) {
  
  var REST = new Collection(emitter_klass).extend({
    
    add: function (m) {
      this.trigger('adding', [m]);
      var self = this;
      setTimeout(function () {
        Collection.prototype.add.apply(self, [m])
      }, 2000);
    },
    
    remove: function (m) {
      this.trigger('removing', [m]);
      var self = this;
      setTimeout(function () {
        Collection.prototype.remove.apply(self, [m])
      }, 2000);
    }
    
  });
  
  return REST;
}