//mysql -u drivesense -h mysql.cs.wisc.edu -p --skip-secure-auth

var mysql      = require('mysql');
var mysql_promise = require('promise-mysql');
var config     = require('./config');

var options = {
  host     : config.database.host,
  user     : config.database.user,
  password : config.database.password,
  database : config.database.db,
  multipleStatements: true,
};

var pool  = mysql.createPool(options);

var pool_promise = mysql_promise.createPool(options);

var getConnection = function(callback) {
    pool.getConnection(function(err, connection) {
        callback(err, connection);
    });
};

function getConnectionDisposer() {
  return pool_promise.getConnection().disposer(function(connection) {
    pool_promise.releaseConnection(connection);
  });
}

module.exports.getConnection = getConnection;
module.exports.getConnectionDisposer = getConnectionDisposer;
