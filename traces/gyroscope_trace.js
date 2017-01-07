var DBObject = require("../dbobject.js")

var GyroscopeTrace = DBObject.extend();
GyroscopeTrace.user_facing = ['time', 'x', 'y', 'z'];
GyroscopeTrace.private = ['tripid']

module.exports = GyroscopeTrace;

