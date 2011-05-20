M.REST = function (emitter_klass) {
  
  var REST = new M.Scope(emitter_klass).extend({
    
    add: function (m) {
      this.trigger('adding', [m]);
      var self = this;
      setTimeout(function () {
        M.Collection.prototype.add.apply(self, [m])
      }, 2000);
    },
    
    remove: function (m) {
      this.trigger('removing', [m]);
      var self = this;
      setTimeout(function () {
        M.Collection.prototype.remove.apply(self, [m])
      }, 2000);
    }
    
  });
  
  return REST;
}