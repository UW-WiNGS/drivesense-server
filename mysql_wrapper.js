var conn = require('./mysql').dbcon;


var mysqlwrapper = function() {

}

mysqlwrapper.prototype.userSignUp = function (user, callback) {
  var sql = "insert into user set ? ";
  conn.query(sql, user, function(err, rows, field){
    if(err) {
      callback(err, null);
    } else {
      callback(null, rows.insertId);
    }
  });
}


mysqlwrapper.prototype.userSignIn = function (user, callback) {
  var sql = "select count(*) as cnt from user where email like binary '" + user.email + "' and password like binary '" + user.password + "'";
  conn.query(sql, user, function(err, rows, field){
    if(err) {
      callback(err, null);
    } else if(rows && rows[0].cnt < 1) {
      callback(new Error("not registered"), null);
    } else {
      callback(null, rows[0].cnt);
    }
  });
}

module.exports = new mysqlwrapper();


