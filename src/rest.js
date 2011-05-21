Catwalk.REST = function (emitter) {
  
  var REST = new Catwalk.Scope(emitter).extend({
    
    add: function (m) {
      this.trigger('adding', [m]);
      var self = this;
      setTimeout(function () {
        Catwalk.Scope.prototype.add.apply(self, [m])
      }, 2000);
    },
    
    remove: function (m) {
      this.trigger('removing', [m]);
      var self = this;
      setTimeout(function () {
        Catwalk.Scope.prototype.remove.apply(self, [m])
      }, 2000);
    }
    
  });
  
  return REST;
}