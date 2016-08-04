var conn = require('./mysql').dbcon;


var mysqltrip = function() {

}

mysqltrip.prototype.insertTrip = function (trip, callback) {
  var sql = "insert into trip set ? ";
  conn.query(sql, trip, function(err, rows, field){
    if(err) {
      callback(err, null);
    } else {
      callback(null, rows.insertId);
    }
  });
}

mysqltrip.prototype.getTripsByUserID = function (userid, callback) {
  var sql = "select * from trip where userid = " + userid + " and tripstatus >= 1;"; 
  conn.query(sql, function(err, rows, field){
    if(err) {
      callback(err, null);
    } else {
      callback(null, rows);
    }
  });
}


/**
 * deleted by Android 
 */
mysqltrip.prototype.androidDeleteTrip = function (deviceid, starttimes, callback) {
  var sql = "UPDATE trip SET tripstatus = -1 WHERE deviceid = '" + deviceid + "' and starttime in (?);";  
  conn.query(sql, [starttimes], function(err, rows, field){
    if(err) {
      console.log("androidDeleteTrip");
      console.log(err);
    } 
    callback(err, null); 
  });
}

mysqltrip.prototype.getDeletedTrips = function (deviceid, callback) {
  var sql = "select starttime from trip where deviceid = '" + deviceid + "' and tripstatus = 0;"; 
  conn.query(sql, function(err, rows, field){
    if(err) {
      console.log("getDeletedTrips");
      console.log(err);
      callback(err, null);
    } else {
      callback(null, rows);
    }
  });
}




//deleted by website
mysqltrip.prototype.deleteTrip = function (tripid, callback) {
  var sql = "UPDATE trip SET tripstatus = 0 WHERE tripid = " + tripid + ";";  
  conn.query(sql, function(err, rows, field){
    if(err) {
      callback(err, null);
    } else {
      callback(null, null);
    }
  });
}

mysqltrip.prototype.insertGPS = function (tripid, data, callback) {
  var sql = "INSERT INTO gps (tripid, time, lat, lng, alt, speed, score, event) VALUES ?";
  var values = [];
  for(var i = 0; i < data.length; ++i) {
    var item = data[i];
    var row = [tripid, item.time, item.x0, item.x1, item.x5, item.x2, item.x3, item.x4];
    values.push(row);
  }
  conn.query(sql, [values], function(err) {
    if(err) {
      console.log(err); 
    } 
    callback(err, null); 
  });
}

mysqltrip.prototype.loadGPS = function (userid, callback) {
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
  });
}


module.exports = new mysqltrip();


