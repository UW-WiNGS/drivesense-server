
function Trip() {
}

Trip.user_facing = ['guid', 'deviceid', 'model', 'starttime', 'endtime', 'distance', 'score', 'tripstatus'];
Trip.private = ['userid', 'tripid']

//Fill in this trip object using the keys in uobj
Trip.prototype.fromObject = function(uobj) {
  var all_keys = Trip.private.concat(Trip.user_facing);
  for (var i = 0; i < all_keys.length; ++i) {
    var key = all_keys[i];
    if(uobj[key] !== undefined) {
      this[key] = uobj[key];
    }
  }
}

//Fill in this trip object, but only using keys from the user_facing list
Trip.prototype.fromObjectSafe = function(uobj) {
  for (var i = 0; i < Trip.user_facing.length; ++i) {
    var key = Trip.user_facing[i];
    if(uobj[key] !== undefined) {
      this[key] = uobj[key];
    }
  }
}

Trip.prototype.user_facing_vals = function() {
  var output = {};
  for (var i = 0; i < Trip.user_facing.length; ++i) {
    var key = Trip.user_facing[i];
    if(this[key] !== undefined) {
      output[key] = this[key];
    }
  }
  return output;
}

module.exports = Trip;

