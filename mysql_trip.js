var mysql = require('./mysql.js');
var Trip = require('./trip.js');


var mysqltrip = function() {

}

var addTracesToTrip = function(trip, callback) {

}

mysqltrip.prototype.updateOrCreateTrip = function (trip, user, callback) {
  if(trip.guid){
    trip.userid = user.userid;
    mysql.getConnection(function(err, conn) {
      if(err) {
        callback(err, null);
        return;
      }
      sql = "SELECT * FROM `trip` WHERE `guid` LIKE ?;";
      conn.query(sql, trip.guid, function(err, rows, field) {
        if(err) {
          callback(err, null);
          conn.release();
        } else if (rows.length==0) {
          //trip with this guid does not exist
          var sql = "INSERT INTO `trip` SET ?;";
          console.log(trip);
          conn.query(sql, [trip], function(err, rows, field){
            if(err) {
              console.log(err);
              callback(err, null);
            } else {
              //trip was inserted
              callback(null, trip);
            }
            conn.release();
          });
        } else {
          //trip does exist. update it if and only if the user owns it
          if(rows[0].userid == user.userid) {
            console.log("Trip guid "+trip.guid+" exists, updating it ")
            sql="UPDATE `trip` SET ? WHERE `trip`.`guid` = ?; SELECT * FROM `trip` WHERE `guid` LIKE ?;"
            conn.query(sql, [trip.user_facing_vals(), trip.guid, trip.guid], function(err, rows, field){
              if(err) {
                console.log(err);
                callback(err, null);
              } else {
                //trip was inserted
                trip = new Trip();
                trip.fromObjectSafe(rows[1][0]);
                callback(null, trip);
              }
              conn.release();
            });
          } else {
            console.log("Trip guid "+trip.guid+" not owned by user");
            conn.release();
            callback("GUID owned by another user", null);
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
    sql = "SELECT * FROM `trip` WHERE `guid` LIKE ?;";
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


