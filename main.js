var fs = require('fs-extra');       //File System - for file manipulation
var util = require('util');
var path = require('path');     //used for file path


var express = require('express');    //Express Web Server 
var bodyparser = require('body-parser');

var route = require('./route');
var auth = require('./auth');
var app = express();


var bodyLogger = function (req, res, next) {
  var email = "";
  if(req.user)
    email = req.user.email;

  console.log(req.ip+" " +req.url +" " +email+ ": " + JSON.stringify(req.body));
  next();
};

app.use(bodyparser.json({limit: '50mb'}));
app.use(bodyparser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(express.static(path.join(__dirname, 'public'))); 

app.post('/auth/signup', auth.signup, auth.signin);
app.post('/auth/signin', [auth.passport.authenticate('local', {session:false}), auth.signin]);
app.post('/auth/google',[auth.passport.authenticate('google-id-token', {session:false}), auth.signin]);
app.post('/auth/facebook',[auth.passport.authenticate('facebook-token', {session:false}), auth.signin]);
app.post('/auth/changepassword', [auth.passport.authenticate('jwt', { session: false}), auth.changePassword]);


app.get('/signinstatus', [auth.passport.authenticate('jwt', { session: false}), auth.signinstatus]);
app.post('/searchtrips', [auth.passport.authenticate('jwt', { session: false}), route.searchtrips]);

app.get('/allTrips', [auth.passport.authenticate('jwt', { session: false}), bodyLogger, route.allTrips])
app.post('/updateTrip', [auth.passport.authenticate('jwt', { session: false}), route.updateTrip]);
app.post('/tripTraces', [auth.passport.authenticate('jwt', { session: false}), route.tripTraces]);

var server = app.listen(8000, function() {
    console.log('Listening on port %d', server.address().port);
});
