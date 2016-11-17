var DBObject = require("../dbobject.js")

var AccelerometerTrace = DBObject.extend();
AccelerometerTrace.user_facing = ['time', 'x', 'y', 'z'];
AccelerometerTrace.private = ['tripid']

module.exports = AccelerometerTrace;

