var mysql = require('./mysql.js');
var Trip = require('./trip.js');
var TripTrace = require('./traces/trip_trace.js');
var AccelerometerTrace = require('./traces/accelerometer_trace.js');
var GyroscopeTrace = require('./traces/gyroscope_trace.js');


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
      if(type == "Trip") {
        sqls += "INSERT INTO `trip_trace` SET ?;"
        trace= new TripTrace();
        trace.fromObjectSafe(value);
        trace.tripid = trip.tripid;
        traces.push(trace)
      } else if(type == "Accel") {
        sqls += "INSERT INTO `accelerometer_trace` SET ?;"
        trace= new AccelerometerTrace();
        trace.fromObjectSafe(value);
        trace.tripid = trip.tripid;
        traces.push(trace)
      } else if(type == "Gyro") {
        sqls += "INSERT INTO `gyroscope_trace` SET ?;"
        trace= new GyroscopeTrace();
        trace.fromObjectSafe(value);
        trace.tripid = trip.tripid;
        traces.push(trace)
      }
    }
    if(traces.length!=0) {
      conn.query(sqls, traces, function(err, rows, field) {
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
      conn.query(sql, trip.guid, function(err, rows, field) {
        if(err) {
          callandrelease(err, null);
        } else if (rows.length==0) {
          //trip with this guid does not exist
          var sql = "INSERT INTO `trip` SET ?;";
          console.log("Trip guid "+trip.guid+" is new, inserting it ")
          conn.query(sql, [trip], function(err, rows, field){
            if(err) {
              console.log(err);
              callandrelease(err, null);
            } else {
              //trip was inserted
              callandrelease(null, trip);
            }
          });
        } else {
          //trip does exist. update it if and only if the user owns it
          if(rows[0].userid == user.userid) {
            console.log("Trip guid "+trip.guid+" exists, updating it ")
            var sql="UPDATE `trip` SET ? WHERE `trip`.`guid` = ?; SELECT * FROM `trip` WHERE `guid` LIKE ?;"
            conn.query(sql, [trip.user_facing_vals(), trip.guid, trip.guid], function(err, rows, field){
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

mysqltrip.prototype.getTrip = function (guid, callback) {
  mysql.getConnection(function(err, conn) {
    if(err) {
      callback(err, null);
      return;
    }
    var sql = "SELECT * FROM `trip` WHERE `guid` LIKE ?;";
    conn.query(sql, guid, function(err, rows, field) {
      if(err) {
        callback(err, null);
      } else if (rows.length!=1) {
        callback(null, null);
      } else {
        callback(null, rows[0]);
      }
      conn.release();
    });
  });
}

mysqltrip.prototype.getTripsByUserID = function (userid, callback) {
  mysql.getConnection(function(err, conn) {
    if(err) {
      callback(err, null);
      return;
    }
    var sql = "select ?? from trip where userid = ? and tripstatus >= 1;"; 
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
    var sql = "select guid from trip where deviceid = '" + deviceid + "' and tripstatus = 0;"; 
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
    var sql = "SELECT * FROM trip INNER JOIN trip_trace on trip_trace.tripid = trip.tripid"+
    " WHERE trip.tripid IN (SELECT tripid FROM trip_trace GROUP BY tripid "+
    "HAVING min(time) >= " + start +" and MIN(time) <= " + end + ") and userid = " + userid + " and tripstatus >= 1";

    conn.query(sql, function(err, rows) {
      if (err) {
        callback(err, null);
      } else if (rows) {
        callback(null, rows);
      } else {
        callback(null, null);
      }
      conn.release();
    });
  });
}



module.exports = new mysqltrip();


