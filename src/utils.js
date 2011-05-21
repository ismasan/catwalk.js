function NewUUID(){
  return Math.uuid(24, 16).toLowerCase();
}

var Base = {
  extend: function(obj) {
    var args = Array.prototype.slice.call(arguments,0);
    args.unshift(this)
    _.extend.apply(_, args)
    return this
  },

  include: function(obj) {
    var args = Array.prototype.slice.call(arguments,0);
    args.unshift(this.prototype)
    _.extend.apply(_, args)
    return this
  }
};
