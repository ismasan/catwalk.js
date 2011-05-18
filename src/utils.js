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