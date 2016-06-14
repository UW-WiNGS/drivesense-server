var express = require('express');    //Express Web Server 
var busboy = require('connect-busboy'); //middleware for form/file upload
var path = require('path');     //used for file path
var fs = require('fs-extra');       //File System - for file manipulation
var util = require('util');
var sqlite3 = require('sqlite3').verbose();

/*
var dir = "./databases/6c9b21c5b0db3074/";
var files = fs.readdirSync(dir);
*/

/*
var dbfile = dir + files[0];

console.log(dbfile);

var db = new sqlite3.Database(dbfile);
var check;
db.all("SELECT * FROM gps;", function(err, rows) {
  console.log(rows);
});
*/

var mysql_wrapper = require('./mysql_wrapper');

var email = "kanglei1130@gmail.com";
mysql_wrapper.getUserIDByEmail(email, function(err, id){
  console.log(id);  
});

//db.close();

