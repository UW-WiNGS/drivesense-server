var conn = require('./mysql').dbcon;


var mysqluser = function() {

}

mysqluser.prototype.getUserIDByEmail = function (email, callback) {
  var sql = "select userid from user where email like binary '" + email + "'";
  conn.query(sql, function(err, rows, field){
    if(err) {
      callback(err, null);
    } else if(rows.length == 0) {
      callback(new Error("no user has email:" + email), null);
    } else {
      callback(null, rows[0].userid);
    }
  });
}


mysqluser.prototype.userSignUp = function (user, callback) {
  var sql = "insert into user set ? ";
  conn.query(sql, user, function(err, rows, field){
    if(err) {
      callback(err, null);
    } else {
      callback(null, rows.insertId);
    }
  });
}

mysqluser.prototype.getUserByID = function (userid, callback) {
  var sql = "select * from user where userid = " + userid + ";"; 
  conn.query(sql, function(err, rows, field){
    if(err) {
      callback(err, null);
    } else if(rows.length == 0) {
      callback(new Error("not registered"), null);
    } else {
      callback(null, rows[0]);
    }
  });
}


mysqluser.prototype.userSignIn = function (user, callback) {
  var sql = "select * from user where email like binary '" + user.email + "' and password like binary '" + user.password + "'";
  conn.query(sql, user, function(err, rows, field){
    if(err) {
      callback(err, null);
    } else if(rows.length == 0) {
      callback(new Error("not registered"), null);
    } else {
      callback(null, rows[0]);
    }
  });
}

module.exports = new mysqluser();

