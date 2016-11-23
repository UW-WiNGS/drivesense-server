var path = require('path');     //used for file path
var mysqluser = require('./mysql_user.js');
var mysqltrip = require('./mysql_trip.js');
var User = require('./user.js');
var Trip = require('./trip.js');
var TripTrace = require('./traces/trip_trace.js');

var fs = require('fs-extra');
var jwt = require('jsonwebtoken');
var util = require('util');
var formidable = require('formidable');
var sqlite3 = require('sqlite3').verbose();



var searchtrips = function (req, res, next) {
  var userid = req.user.userid;
  var start = req.body.start;
  var end = req.body.end;
  var trips = {};
  mysqltrip.searchTrips(userid, start, end, function(err, rows){
    if(err) {
      var msg = {status: 'fail', data: err.toString()};
      res.json(msg);
      return;
    }
    var msg = {status: 'success', data:rows};
    res.json(msg);
  });  
};

var tripTraces = function (req, res, next) {
  var userid = req.user.userid;
  mysqltrip.getTripTraces(userid, req.body.guid, req.body.type, req.body.start, function(err, traces) {
    if(err) {
      var msg = {status: 'fail', data: err.toString()};
      res.json(msg);
      return;
    }
    res.json(traces);
  });
}

// Get the trip attributes for all of the currently logged in user's trips
// Does not include the traces for the trips
var allTrips = function (req, res, next) {
  var userid = req.user.userid;
  mysqltrip.getTripsByUserID(userid, function(err, rows) {
    if(err) {
      res.status(500)
      var msg = {status: 'fail', data: err.toString()};
      res.json(msg);
      return;
    }
    res.json(rows);
  });
}

// Update the actual values of a trip row (deleted, finalized, starttime, etc)
// If the trip does not exist it will be created
// If trip traces are included in the "traces" key, they will be added to the trip
// Return value:
// JSON representation of the trip
// Hint: An empty update (no changes) simply returns the current state of the trip
var updateTrip = function(req, res, next) {
  var trip = new Trip();
  trip.fromObjectSafe(req.body);
  mysqltrip.updateOrCreateTrip(trip, req.user, function(err, trip) {
    if(err) {
      res.status(500)
      var msg = {status: 'fail', data: err.toString()};
      console.log("Error for trip:" + trip.guid + " " + err.toString());
      res.json(msg);
      return;
    } else if(req.body.traces) {
      //trip was successfully updated or created
      //and we have new traces to add to it
      console.log("Adding " +req.body.traces.length+ " traces to trip "+trip.guid);
      mysqltrip.addTracesToTrip(req.body.traces, trip, function(err) {
        if(err) {
          res.status(500)
          res.json({status: 'fail', data: err.toString()})
          console.log("Error adding traces for trip:" + trip.guid + " " + err.toString());
        } else {
          res.json(trip.user_facing_vals());
        }
      });
    } else {
      // no new traces to add, return trip object
      res.json(trip.user_facing_vals());
    }
  });
}


module.exports.allTrips = allTrips;
module.exports.tripTraces = tripTraces;
module.exports.updateTrip = updateTrip;
module.exports.searchtrips = searchtrips;






