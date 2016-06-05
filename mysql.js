var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
//  password : 'drivesense',
  password : 'studentsublease',
  database : 'drivesense_wings',
  multipleStatements: true,
});

connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
  console.log('connected as id ' + connection.threadId);
});

module.exports.dbcon = connection;
