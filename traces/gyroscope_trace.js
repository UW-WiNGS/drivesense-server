
function GyroscopeTrace() {
}

GyroscopeTrace.user_facing = ['time', 'x', 'y', 'z'];
GyroscopeTrace.private = ['tripid']

//Fill in this trip object using the keys in uobj
GyroscopeTrace.prototype.fromObject = function(uobj) {
  var all_keys = GyroscopeTrace.private.concat(GyroscopeTrace.user_facing);
  for (var i = 0; i < all_keys.length; ++i) {
    var key = all_keys[i];
    if(uobj[key] !== undefined) {
      this[key] = uobj[key];
    }
  }
}

//Fill in this trip object, but only using keys from the user_facing list
GyroscopeTrace.prototype.fromObjectSafe = function(uobj) {
  for (var i = 0; i < GyroscopeTrace.user_facing.length; ++i) {
    var key = GyroscopeTrace.user_facing[i];
    if(uobj[key] !== undefined) {
      this[key] = uobj[key];
    }
  }
}

GyroscopeTrace.prototype.user_facing_vals = function() {
  var output = {};
  for (var i = 0; i < GyroscopeTrace.user_facing.length; ++i) {
    var key = GyroscopeTrace.user_facing[i];
    if(this[key]) {
      output[key] = this[key];
    }
  }
  return output;
}

module.exports = GyroscopeTrace;
