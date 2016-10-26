//mysql -u drivesense -h mysql.cs.wisc.edu -p --skip-secure-auth

var mysql      = require('mysql');
// var connection = mysql.createConnection({
//   host     : 'localhost',
//   user     : 'root',
//   password : 'drivesense',
//   database : 'drivesense_wings',
//   multipleStatements: true,
// });

// connection.connect(function(err) {
//   if (err) {
//     console.error('error connecting: ' + err.stack);
//     return;
//   }
//   console.log('connected as id ' + connection.threadId);
// });

var pool  = mysql.createPool({
  host     : 'localhost',
  user     : 'wirover',
  password : '',
  database : 'drivesense_wings',
  multipleStatements: true,
});

var getConnection = function(callback) {
    pool.getConnection(function(err, connection) {
        callback(err, connection);
    });
};

module.exports.getConnection = getConnection;

//module.exports.dbcon = connection;
