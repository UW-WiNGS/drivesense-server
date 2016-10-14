var conn = require('./mysql').dbcon;
var User = require('./user.js');

var mysqluser = function() {

}

mysqluser.prototype.getUserByEmail = function (email, callback) {
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
  });
}


mysqluser.prototype.userSignIn = function (email, password, callback) {
  var sql = "select * from user where email like ? and password like ?";
  conn.query(sql, [email, password], function(err, rows, field){
    if(err) {
      callback(err, null);
    } else if(rows.length == 0) {
      callback(null, null);
    } else {
      var user = new User();
      user.fromObject(rows[0]);
      callback(null, user);
    }
  });
}

module.exports = new mysqluser();


