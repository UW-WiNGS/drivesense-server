var conn = require('./mysql').dbcon;


var mysqlwrapper = function() {

}

mysqlwrapper.prototype.insertUser = function (user, callback) {
  var sql = "insert into user set ? ";
  conn.query(sql, user, function(err, rows, field){
    if(err) {
      callback(err, null);
    } else {
      callback(null, rows.insertId);
    }
  });
}


module.exports = new mysqlwrapper();


