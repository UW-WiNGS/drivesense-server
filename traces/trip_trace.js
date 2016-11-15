
function TripTrace() {
}

TripTrace.user_facing = ['time', 'score', 'tilt', 'brake', 'lat', 'lon', 'alt', 'speed'];
TripTrace.private = ['tripid']

//Fill in this trip object using the keys in uobj
TripTrace.prototype.fromObject = function(uobj) {
  var all_keys = TripTrace.private.concat(TripTrace.user_facing);
  for (var i = 0; i < all_keys.length; ++i) {
    var key = all_keys[i];
    if(uobj[key] !== undefined) {
      this[key] = uobj[key];
    }
  }
}

//Fill in this trip object, but only using keys from the user_facing list
TripTrace.prototype.fromObjectSafe = function(uobj) {
  for (var i = 0; i < TripTrace.user_facing.length; ++i) {
    var key = TripTrace.user_facing[i];
    if(uobj[key] !== undefined) {
      this[key] = uobj[key];
    }
  }
}

TripTrace.prototype.user_facing_vals = function() {
  var output = {};
  for (var i = 0; i < TripTrace.user_facing.length; ++i) {
    var key = TripTrace.user_facing[i];
    if(this[key]) {
      output[key] = this[key];
    }
  }
  return output;
}

module.exports = TripTrace;
