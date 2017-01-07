var DBObject = require("./dbobject.js")

var Trip = DBObject.extend();
Trip.user_facing = ['guid', 'deviceid', 'model', 'starttime', 'endtime', 'distance', 'status', 'data_starttime', 'data_endtime', 'score'];
Trip.private = ['userid', 'tripid']

module.exports = Trip;

