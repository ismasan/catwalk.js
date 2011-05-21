Catwalk.Events = {
  
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