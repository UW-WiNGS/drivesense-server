var fs = require('fs-extra');       //File System - for file manipulation
var util = require('util');
var sqlite3 = require('sqlite3').verbose();
var path = require('path');     //used for file path


var express = require('express');    //Express Web Server 
var busboy = require('connect-busboy'); //middleware for form/file upload
var bodyparser = require('body-parser');
var cookieParser = require('cookie-parser');

var route = require('./route');
var app = express();


app.use(busboy());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'))); 


app.post('/upload', route.upload);
app.post('/signup', route.signup);
app.post('/signin', [route.signin]);
app.get('/signout', [route.signout]);


app.get('/signinstatus', [route.tokenverification, route.signinstatus]);
app.get('/mytrips', [route.tokenverification, route.showtrip]);


app.post('/androidsignin', route.androidsignin);
app.post('/androidsignup', route.androidsignup);


var server = app.listen(8000, function() {
    console.log('Listening on port %d', server.address().port);
});
