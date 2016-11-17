var DBObject = require("../dbobject.js")

var TripTrace = DBObject.extend();
TripTrace.user_facing = ['time', 'score', 'tilt', 'brake', 'lat', 'lng', 'alt', 'speed'];
TripTrace.private = ['tripid']

module.exports = TripTrace;

