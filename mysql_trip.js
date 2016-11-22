var mysql = require('./mysql.js');
var Trip = require('./trip.js');
var TripTrace = require('./traces/trip_trace.js');
var AccelerometerTrace = require('./traces/accelerometer_trace.js');
var GyroscopeTrace = require('./traces/gyroscope_trace.js');

function traceTypeAndColumn(stringname) {
  if(stringname == "Trip") {
    return [TripTrace, "trip_trace"];
  } else if(stringname == "Accel") {
    return [AccelerometerTrace, "accelerometer_trace"];
  } else if(stringname == "Gyro") {
    return [GyroscopeTrace, "gyroscope_trace"];
  } else if(stringname == "Rotation") {
    return null;
  } else {
    return null;
  }
}

var mysqltrip = function() {

}

//trace format:
// { "type": "Trip", "value": { "alt": 0, "lat": 43, "lon": -89.004, "speed": 0,"time": 1479247246164, etc.... }}
mysqltrip.prototype.addTracesToTrip = function(trace_messages, trip, callback) {
  mysql.getConnection(function(err, conn) {
    if(!trip.tripid) {
      callback("No trip id for traces");
      return;
    }
    if(err) {
      callback(err);
      return;
    }
    function callandrelease(err) {
      conn.release();
      callback(err);
    }

    var sqls = "";
    var traces = [];
    for (var i = trace_messages.length - 1; i >= 0; i--) {
      tracemessage = trace_messages[i];
      var type = tracemessage.type;
      var value = tracemessage.value;
      var typeColumn = traceTypeAndColumn(type);
      if(typeColumn) {
        sqls += "INSERT INTO "+typeColumn[1]+" SET ?;"
        trace= new typeColumn[0]();
        trace.fromObjectSafe(value);
        trace.tripid = trip.tripid;
        traces.push(trace)
      }
    }
    if(traces.length!=0) {
      conn.query(sqls, traces, function(err, rows) {
        callandrelease(err);
      });
    } else {
      callandrelease(null);
    }
  });
}

mysqltrip.prototype.updateOrCreateTrip = function (trip, user, callback) {
  if(trip.guid){
    trip.userid = user.userid;
    mysql.getConnection(function(err, conn) {
      if(err) {
        callback(err, null);
        return;
      }
      function callandrelease(err, trip) {
        conn.release();
        callback(err, trip);
      }
      var sql = "SELECT * FROM `trip` WHERE `guid` LIKE ?;";
      conn.query(sql, trip.guid, function(err, rows) {
        if(err) {
          callandrelease(err, null);
        } else if (rows.length==0) {
          //trip with this guid does not exist
          var sql = "INSERT INTO `trip` SET ?;";
          console.log("Trip guid "+trip.guid+" is new, inserting it ")
          conn.query(sql, [trip], function(err, rows){
            if(err) {
              console.log(err);
              callandrelease(err, null);
            } else {
              //trip was inserted
              trip.tripid=rows.insertId;
              callandrelease(null, trip);
            }
          });
        } else {
          //trip does exist. update it if and only if the user owns it
          if(rows[0].userid == user.userid) {
            console.log("Trip guid "+trip.guid+" exists, updating it ")
            var sql="UPDATE `trip` SET ? WHERE `trip`.`guid` = ?; SELECT * FROM `trip` WHERE `guid` LIKE ?;"
            conn.query(sql, [trip.user_facing_vals(), trip.guid, trip.guid], function(err, rows){
              if(err) {
                console.log(err);
                callandrelease(err, null);
              } else {
                //trip was inserted
                trip = new Trip();
                trip.fromObject(rows[1][0]);
                callandrelease(null, trip);
              }
            });
          } else {
            console.log("Trip guid "+trip.guid+" not owned by user");
            callandrelease("GUID owned by another user", null);
          }
        }
      });
    });
  }
}

mysqltrip.prototype.getTripTraces = function (userid, tripguid, tracetypename, start, callback) {
  var typeColumn = traceTypeAndColumn(tracetypename)
  if(!typeColumn) {
    callback("No valid type specified", null);
    return;
  }
  mysql.getConnection(function(err, conn) {
    if(err) {
      callback(err, null);
      return;
    }
    function callandrelease(err, traces) {
      conn.release();
      callback(err, traces);
    }
    var sql = "SELECT * FROM `trip` LEFT JOIN ?? as T ON T.tripid = trip.tripid WHERE trip.guid = ? AND T.time >= ? AND userid = ?";
    conn.query(sql, [typeColumn[1], tripguid, start, userid], function(err, rows, field){
      if(err) {
        callandrelease(err, null);
      } else {
        var traces = rows.map(function(elem){
          var trace = new typeColumn[0]();
          trace.fromObjectSafe(elem);
          return trace;
        });
        callandrelease(null, traces);
      }
    });
  });
}

mysqltrip.prototype.getTripsByUserID = function (userid, callback) {
  mysql.getConnection(function(err, conn) {
    if(err) {
      callback(err, null);
      return;
    }
    var sql = "select ?? from trip where userid = ? and status >= 1;"; 
    conn.query(sql, [Trip.user_facing, userid], function(err, rows, field){
      if(err) {
        callback(err, null);
      } else {
        callback(null, rows);
      }
      conn.release();
    });
  });
}

mysqltrip.prototype.getDeletedTrips = function (deviceid, callback) {
  mysql.getConnection(function(err, conn) {
    if(err) {
      callback(err, null);
      return;
    }
    var sql = "select guid from trip where deviceid = '" + deviceid + "' and status = 0;"; 
    conn.query(sql, function(err, rows, field){
      if(err) {
        console.log("getDeletedTrips");
        console.log(err);
        callback(err, null);
      } else {
        callback(null, rows);
      }
      conn.release();
    });
  });
}

mysqltrip.prototype.searchTrips = function (userid, start, end, callback) {
  mysql.getConnection(function(err, conn) {
    if(err) {
      callback(err, null);
      return;
    }
    var sql = "SELECT * FROM derived_trip WHERE data_starttime >= " + start +" and data_endtime <= " + end + " and userid = " + userid + " and status >= 1 ORDER BY data_endtime DESC";

    conn.query(sql, function(err, rows) {
      if (err) {
        callback(err, null);
      } else if (rows) {
        var trips = rows.map(function(elem){
          var trip = new Trip();
          trip.fromObjectSafe(elem);
          return trip;
        });
        callback(null, trips);
      } else {
        callback(null, null);
      }
      conn.release();
    });
  });
}



module.exports = new mysqltrip();


