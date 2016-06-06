var fs = require('fs-extra');       //File System - for file manipulation
var util = require('util');
var sqlite3 = require('sqlite3').verbose();
var path = require('path');     //used for file path


var express = require('express');    //Express Web Server 
var busboy = require('connect-busboy'); //middleware for form/file upload
var bodyparser = require('body-parser');

var route = require('./route');
var app = express();

app.use(busboy());
app.use(express.static(path.join(__dirname, 'public'))); 
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


app.post('/upload', route.upload);
app.get('/mytrips', route.showtrip);
app.post('/signup', route.signup);
app.post('/signin', route.signin);
app.post('/androidsignin', route.androidsignin);
app.post('/androidsignup', route.androidsignup);


var server = app.listen(8000, function() {
    console.log('Listening on port %d', server.address().port);
});
