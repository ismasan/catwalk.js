Catwalk.Model = function (klass_name) {  
  
  function Model () {
    this.uid = NewUUID();
    this.attributes = {};
    if(arguments.length > 0){this.attr(arguments[0])}
    this._trigger('add');
  }
  
  Model._name = klass_name;
  
  // Extend the constructor for things such as Model.extend and Model.include
  Base.extend.call(Model, Base)

  Model.extend(Catwalk.Events)
  
  // Instance methods
  Model.include(Catwalk.Events, {
    
    // Trigger an event on the instance and on the constructor.
    // This is the main interface between models and scopes, which bind to model constructors
    _trigger: function (event_name) {
      this.trigger(event_name);
      this.constructor.trigger(event_name, [this]);
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
  });
  
  return Model;
   
}
