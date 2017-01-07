var mysql = require('./mysql.js');
var Trip = require('./trip.js');
var TripTrace = require('./traces/trip_trace.js');
var AccelerometerTrace = require('./traces/accelerometer_trace.js');
var GyroscopeTrace = require('./traces/gyroscope_trace.js');
var Promise = require("bluebird");

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

// NOTE: Trip GUIDs are ONLY GUARANTEED TO BE UNIQUE PER USER
// You cannot only select by guid without a userid or you may get more than one / the wrong trip

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
      callback(err);
      conn.release();
    }

    var traces_to_insert = {};
    for (var i = trace_messages.length - 1; i >= 0; i--) {
      tracemessage = trace_messages[i];
      var trace_type_name = tracemessage.type;
      var value = tracemessage.value;
      var typeColumn = traceTypeAndColumn(trace_type_name);
      if(typeColumn) {
        var table_name = typeColumn[1];
        var trace_class = typeColumn[0];
        if(!traces_to_insert[table_name])
        {
          traces_to_insert[table_name] = {'trace_class':trace_class, 'values':[]}
        }
        trace= new trace_class();
        trace.fromObjectSafe(value);
        trace.tripid = trip.tripid;
        traces_to_insert[table_name].values.push(trace)
      }
    }
    var query_promises = [];
    var promise_query = Promise.promisify(conn.query, {context: conn});
    for(var table_name in traces_to_insert) {
      var trace_class = traces_to_insert[table_name].trace_class;
      var column_names = trace_class.user_facing.concat(trace_class.private);
      // console.log(traces_to_insert[table_name].values);
      var values = [];
      for (var i = 0; i < traces_to_insert[table_name].values.length; i++) {
        var single_trace = traces_to_insert[table_name].values[i];
        values.push(column_names.map(function(col) {return single_trace[col]}));
      }
      // console.log(table_name);
      // console.log(column_names);
      // console.log(values);
      var sql = "INSERT IGNORE INTO ?? (??) VALUES ?"
      query_promises.push(promise_query(sql, [table_name,column_names, values]));
    }
    Promise.all(query_promises).then(function() {
      console.log("All the files traces were added");
      callandrelease();
    }, function(err) {
      callandrelease(err);
    });
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
      console.log("Insert or update for "+trip.guid+" for user "+trip.userid);
      var sql="INSERT INTO `trip` SET ? ON DUPLICATE KEY UPDATE ?; SELECT * FROM `trip` WHERE `userid` = ? and `guid` LIKE ?;"
      conn.query(sql, [trip, trip, trip.userid, trip.guid], function(err, rows){
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
    var sql = "SELECT * FROM `trip` LEFT JOIN ?? as T ON T.tripid = trip.tripid WHERE trip.guid = ? AND T.time >= ? AND trip.userid = ?";
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


