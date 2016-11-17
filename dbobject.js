var Class = require("./simple-inheritance.js")

var DBObject = Class.extend({
  init:function DBObject(){},
  fromObject:function(uobj) {
    var all_keys = this.constructor.private.concat(this.constructor.user_facing);
    for (var i = 0; i < all_keys.length; ++i) {
      var key = all_keys[i];
      if(uobj[key] !== undefined) {
        this[key] = uobj[key];
      }
    }
  },
  fromObjectSafe: function(uobj) {
    for (var i = 0; i < this.constructor.user_facing.length; ++i) {
      var key = this.constructor.user_facing[i];
      if(uobj[key] !== undefined) {
        this[key] = uobj[key];
      }
    }
  },
  user_facing_vals:function() {
    var output = {};
    for (var i = 0; i < this.constructor.user_facing.length; ++i) {
      var key = this.constructor.user_facing[i];
      if(this[key] !== undefined) {
        output[key] = this[key];
      }
    }
    return output;
  }
});

DBObject.user_facing = [];
DBObject.private = []



module.exports = DBObject;

