var mysql = require('./mysql.js');
var User = require('./user.js');

var mysqluser = function() {

}

mysqluser.prototype.getUserByEmail = function (email, callback) {
  mysql.getConnection(function(err, conn) {
    if(err) {
      callback(err, null);
      return;
    }
    var sql = "select * from user where email like ?";
    conn.query(sql, [email], function(err, rows, field){
      if(err) {
        callback(err, null);
      } else if(rows.length == 0) {
        callback(null, null);
      } else {
        var user = new User();
        user.fromObject(rows[0]);
        callback(null, user);
      }
      conn.release();
    });
  });
}


mysqluser.prototype.userSignUp = function (user, callback) {
  mysql.getConnection(function(err, conn) {
    if(err) {
      callback(err, null);
      return;
    }
    var sql = "insert into user set ? ";
    conn.query(sql, user, function(err, rows, field){
      if(err) {
        callback(err, null);
      } else {
        callback(null, rows.insertId);
      }
      conn.release();
    });
  });
}

mysqluser.prototype.getUserByID = function (userid, callback) {
  mysql.getConnection(function(err, conn) {
    if(err) {
      callback(err, null);
      return;
    }
    var sql = "select * from user where userid = ?;"; 
    conn.query(sql, [userid], function(err, rows, field){
      if(err) {
        callback(err, null);
      } else if(rows.length == 0) {
        callback(null, null);
      } else {
        var user = new User();
        user.fromObject(rows[0]);
        callback(null, user);
      }
      conn.release();
    });
  });
}

module.exports = new mysqluser();


