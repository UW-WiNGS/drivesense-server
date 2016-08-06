var fs = require('fs-extra');       //File System - for file manipulation
var util = require('util');
var path = require('path');     //used for file path


var express = require('express');    //Express Web Server 
var bodyparser = require('body-parser');
var cookieParser = require('cookie-parser');

var route = require('./route');
var app = express();


app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'))); 



app.post('/signup', route.signup);
app.post('/signin', [route.signin]);
app.get('/signout', [route.signout]);


app.get('/signinstatus', [route.tokenverification, route.signinstatus]);
app.get('/mytrips', [route.tokenverification, route.showtrips]);
app.post('/removetrip', [route.tokenverification, route.removetrip]);



app.post('/androidsignin', route.androidsignin);
app.post('/androidsignup', route.androidsignup);
app.post('/upload', [route.upload]);
app.post('/androidsync', [route.androidsync]);

var server = app.listen(8000, function() {
    console.log('Listening on port %d', server.address().port);
});
