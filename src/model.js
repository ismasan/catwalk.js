Catwalk.Model = Class.setup(
  
  Catwalk.Events,
  
  {
    init: function () {
      this.uid = NewUUID();
      this.attributes = {}; 
      this._trigger_switch = true;
      if(arguments.length > 0){
        var args = arguments[0];
        this._noTrigger(function () {
          this.attr(args)
        })
      }
      this._trigger('add');
    },
    
    // Run code without triggering associated events
    _noTrigger: function (func) {
      this._trigger_switch = false;
      func.call(this);
      this._trigger_switch = true;
    },
    
    // Trigger an event on the instance and on the constructor.
    // This is the main interface between models and scopes, which bind to model constructors
    _trigger: function (event_name) {
      if(this._trigger_switch){
        this.trigger(event_name);
        this.constructor.trigger(event_name, [this]);
      }
    },
    
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
          _.extend(this.attributes, arguments[0]);
          this._trigger('change');
          return this;
        }
      } else {
        this.attributes[arguments[0]] = arguments[1];
        this._trigger('change');
        return this;
      }
    },
    
    destroy: function () {
      this._trigger('remove');
      return this;
    },
    
    save: function () {
      this._trigger('add');
      return this;
    }
  }
  
);

// Catwalk.Model._name = klass_name;

// Extend the constructor for things such as Model.extend and Model.include
// Base.extend.call(Catwalk.Model, {include: Base.include})
_.extend(Catwalk.Model, Catwalk.Events);
