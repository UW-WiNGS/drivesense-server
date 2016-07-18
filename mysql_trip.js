var conn = require('./mysql').dbcon;


var mysqltrip = function() {

}

mysqltrip.prototype.insertTrip = function (trip, callback) {
  var sql = "insert into trip set ? ";
  conn.query(sql, user, function(err, rows, field){
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

mysqltrip.prototype.insertGPS = function (data, callback) {
  var sql = "INSERT INTO gps (tripid, time, lat, lng, speed, score, event) VALUES ?";
  var values = [
    ['demian', 'demian@gmail.com', 1],
    ['john', 'john@gmail.com', 2],
    ['mark', 'mark@gmail.com', 3],
    ['pete', 'pete@gmail.com', 4]
  ];
  conn.query(sql, [values], function(err) {
    if(err) {
      callback(err, null);
    } else {
      callback(null, null);
    }
  });
}

mysqltrip.prototype.loadGPS = function (userid, callback) {
  var sql= "SELECT * FROM trip " +
           "INNER JOIN gps on gps.tripid = trip.tripid " +
           "WHERE userid = " + userid + " and tripstatus >= 1;";
  dbconn.executeQuery(sql, function(err, rows) {
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


