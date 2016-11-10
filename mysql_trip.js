var mysql = require('./mysql.js');


var mysqltrip = function() {

}

mysqltrip.prototype.insertTrip = function (trip, callback) {
  mysql.getConnection(function(err, conn) {
    if(err) {
      callback(err, null);
      return;
    }
    var sql = "insert into trip set ? ";
    conn.query(sql, trip, function(err, rows, field){
      if(err) {
        callback(err, null);
      } else {
        callback(null, rows.insertId);
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
    var sql = "select * from trip where userid = " + userid + " and tripstatus >= 1;"; 
    conn.query(sql, function(err, rows, field){
      if(err) {
        callback(err, null);
      } else {
        callback(null, rows);
      }
      conn.release();
    });
  });
}


/**
 * deleted by Android 
 */
mysqltrip.prototype.androidDeleteTrip = function (deviceid, starttimes, callback) {
  mysql.getConnection(function(err, conn) {
    if(err) {
      callback(err, null);
      return;
    }
    var sql = "UPDATE trip SET tripstatus = -1 WHERE deviceid = '" + deviceid + "' and starttime in (?);";  
    conn.query(sql, [starttimes], function(err, rows, field){
      if(err) {
        console.log("androidDeleteTrip");
        console.log(err);
      } 
      callback(err, null); 
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
    var sql = "select starttime from trip where deviceid = '" + deviceid + "' and tripstatus = 0;"; 
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




//deleted by website
mysqltrip.prototype.deleteTrip = function (userid, tripid, callback) {
  mysql.getConnection(function(err, conn) {
    if(err) {
      callback(err, null);
      return;
    }
    var sql = "UPDATE trip SET tripstatus = 0 WHERE tripid = " + tripid + " and userid = "+ userid + ";";  
    conn.query(sql, function(err, rows, field){
      if(err) {
        callback(err, null);
      } else {
        callback(null, null);
      }
      conn.release();
    });
  });
}

mysqltrip.prototype.insertGPS = function (tripid, data, callback) {
  mysql.getConnection(function(err, conn) {
    if(err) {
      callback(err, null);
      return;
    }
    var sql = "INSERT INTO gps (tripid, time, lat, lng, alt, curspeed, curscore, curevent, curtilt) VALUES ?";
    var values = [];
    for(var i = 0; i < data.length; ++i) {
      var item = data[i];
      var row = [tripid, item.time, item.x0, item.x1, item.x5, item.x2, item.x3, item.x4, item.x6];
      values.push(row);
    }
    conn.query(sql, [values], function(err) {
      if(err) {
        console.log(err); 
      } 
      callback(err, null); 
      conn.release();
    });
  });
}

mysqltrip.prototype.loadGPS = function (userid, callback) {
  mysql.getConnection(function(err, conn) {
    if(err) {
      callback(err, null);
      return;
    }
    var sql= "SELECT * FROM trip " +
           "INNER JOIN gps on gps.tripid = trip.tripid " +
           "WHERE userid = " + userid + " and tripstatus = 1;";
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
mysqltrip.prototype.searchTrips = function (userid, start, end, callback) {
  mysql.getConnection(function(err, conn) {
    if(err) {
      callback(err, null);
      return;
    }
    var sql= "SELECT * FROM trip " +
           "INNER JOIN trip_trace on trip_trace.tripid = trip.tripid " +
           "WHERE userid = " + userid + " and tripstatus = 1 " + 
           "and starttime >= " + start +" and endtime <= " + end + " ;";

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


