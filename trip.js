
function Trip() {
}

Trip.keys = ['userid', 'deviceid', 'model', 'starttime', 'endtime', 'distance', 'score', 'tripstatus'];

Trip.prototype.fromObject = function(uobj) {
  var keys = Trip.keys;
  for (var i = 0; i < keys.length; ++i) {
    var key = keys[i];
    this[key] = uobj[key];
  }
}

module.exports = Trip;

