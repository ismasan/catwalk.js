Catwalk.Model = function (klass_name) {  
  
  function Model () {
    this.uid = NewUUID();
    this.attributes = {};
    if(arguments.length > 0) this.attr(arguments[0])
  }
  
  Model._name = klass_name;
  
  Base.extend.call(Model, Base)

  Model.extend(Catwalk.Events)
  
  // Instance methods
  Model.include(Catwalk.Events, {
    
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
  
  return Model;
   
}
