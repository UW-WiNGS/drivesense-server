var fs = require('fs-extra');       //File System - for file manipulation
var util = require('util');
var path = require('path');     //used for file path


var express = require('express');    //Express Web Server 
var session = require('express-session')
var bodyparser = require('body-parser');
var cookieParser = require('cookie-parser');

var route = require('./route');
var auth = require('./auth');
var app = express();


var myLogger = function (req, res, next) {
  console.log(req.body);
  next();
};

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'))); 

app.post('/auth/signup', auth.signup, auth.signin);
app.post('/auth/signin', [myLogger, auth.passport.authenticate('local', {session:false}), auth.signin]);
app.post('/auth/google',[auth.passport.authenticate('google-id-token', {session:false}), auth.signin]);
app.post('/auth/facebook',[auth.passport.authenticate('facebook-token', {session:false}), auth.signin]);


app.get('/signinstatus', [auth.passport.authenticate('jwt', { session: false}), auth.signinstatus]);
app.get('/mytrips', [auth.passport.authenticate('jwt', { session: false}), route.showtrips]);
app.post('/removetrip', [auth.passport.authenticate('jwt', { session: false}), route.removetrip]);
app.post('/searchtrips', [auth.passport.authenticate('jwt', { session: false}), route.searchtrips]);

app.post('/androidsignin', route.androidsignin);
app.post('/androidsignup', route.androidsignup);
app.post('/upload', [route.upload]);
app.post('/androidsync', [route.androidsync]);

var server = app.listen(8000, function() {
    console.log('Listening on port %d', server.address().port);
});
