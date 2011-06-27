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


// Borrow array functional methods from underscore.js. No point in reinventing an already very round wheel.
// http://documentcloud.github.com/underscore/docs/underscore.html

var array_methods = ['forEach', 'each', 'map', 'reduce', 'reduceRight', 'find', 'detect',
    'filter', 'select', 'reject', 'every', 'all', 'some', 'any', 'include',
    'invoke', 'max', 'min', 'sortBy', 'sortedIndex', 'toArray', 'size',
    'first', 'rest', 'last', 'without', 'indexOf', 'lastIndexOf', 'isEmpty'];

// Mixin this object in class prototypes to get array methods
var array_methods_module = {};
_.each(array_methods, function(method) {
  array_methods_module[method] = function() {
    return _[method].apply(_, [this.collection].concat(_.toArray(arguments)));
  };
});