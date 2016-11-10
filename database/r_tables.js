var conn = require("../mysql.js").dbcon;
var fs = require("fs");

//var tables = ["user"];
var tables = ["trip", "gps", "user"];



/**
 * @brief drop all the tables, for deployment and sharing purpose
 */
function droptables(tables) {
  for (var i = 0; i < tables.length; ++i) {
    console.log("drop table:", tables[i]);
    var dropsql = "start transaction;drop table if exists " + tables[i] + ";commit;";
    conn.query(dropsql, function(err, rows, fields) {
      if(err) {
	console.log("Error occurs when dropping table" + err);
      } 
    });
  }
}


/**
 * @brief create all the tables, for deployment and sharing purpose
 */
function createtables(tables) {
  for (var i = 0; i < tables.length; ++i) {
    console.log("create table:", tables[i]);
    var createsql = fs.readFileSync("./schema/" + tables[i] + ".sql", "utf8");
    conn.query(createsql, function(err, rows, fields) {
      if(err) {
	console.log("Error occurs when creating table:" + err);
      } 
    });
  }
}

droptables(tables);
createtables(tables);






