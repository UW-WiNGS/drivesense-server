
function AccelerometerTrace() {
}

AccelerometerTrace.user_facing = ['time', 'x', 'y', 'z'];
AccelerometerTrace.private = ['tripid']

//Fill in this trip object using the keys in uobj
AccelerometerTrace.prototype.fromObject = function(uobj) {
  var all_keys = AccelerometerTrace.private.concat(AccelerometerTrace.user_facing);
  for (var i = 0; i < all_keys.length; ++i) {
    var key = all_keys[i];
    if(uobj[key] !== undefined) {
      this[key] = uobj[key];
    }
  }
}

//Fill in this trip object, but only using keys from the user_facing list
AccelerometerTrace.prototype.fromObjectSafe = function(uobj) {
  for (var i = 0; i < AccelerometerTrace.user_facing.length; ++i) {
    var key = AccelerometerTrace.user_facing[i];
    if(uobj[key] !== undefined) {
      this[key] = uobj[key];
    }
  }
}

AccelerometerTrace.prototype.user_facing_vals = function() {
  var output = {};
  for (var i = 0; i < AccelerometerTrace.user_facing.length; ++i) {
    var key = AccelerometerTrace.user_facing[i];
    if(this[key]) {
      output[key] = this[key];
    }
  }
  return output;
}

module.exports = AccelerometerTrace;
