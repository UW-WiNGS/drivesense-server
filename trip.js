var DBObject = require("./dbobject.js")

var Trip = DBObject.extend();
Trip.user_facing = ['guid', 'deviceid', 'model', 'starttime', 'endtime', 'distance', 'score', 'tripstatus'];
Trip.private = ['userid', 'tripid']

module.exports = Trip;

