//mysql -u drivesense -h mysql.cs.wisc.edu -p --skip-secure-auth

var mysql      = require('mysql');
var config     = require('./config');


var pool  = mysql.createPool({
  host     : config.database.host,
  user     : config.database.user,
  password : config.database.password,
  database : config.database.db,
  multipleStatements: true,
});

var getConnection = function(callback) {
    pool.getConnection(function(err, connection) {
        callback(err, connection);
    });
};

module.exports.getConnection = getConnection;

//module.exports.dbcon = connection;
