var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var GoogleTokenStrategy = require('passport-google-id-token');
var FacebookTokenStrategy = require('passport-facebook-token');
var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
var mysqluser = require('./mysql_user.js');
var User = require('./user.js');
var jwt = require('jsonwebtoken');
var config     = require('./config');
var bcrypt = require('bcrypt-nodejs');

passport.use(new LocalStrategy({
      usernameField: 'email'
  },
  function(email, password, done) {
    console.log("Sign in attempt for " + email);
    mysqluser.getUserByEmail(email, function(err, user){
      if(err) {
        return done(err);
      }
      if(user && !user.password) {
        console.log("User does not have a password set.");
        //this message unfortunately does not go anywhere because the passport framework is garbage and has no way to return a message in the response
        return done(null, false, { message: 'Your account does not have a password set. Sign in with Google or Facebook.' }); 
      } else if(user && user.password && bcrypt.compareSync(password, user.password)) {
        return done(null, user);
      } else {
        console.log("User entered wrong password.");
        return done(null, false, { message: 'Incorrect username or password.' }); 
      }
    });
  }
));

passport.use(new GoogleTokenStrategy({
    clientID: config.google.clientID,
  },
  function(parsedToken, googleId, done) {
    mysqluser.getUserByEmail(parsedToken.payload.email, function (err, user) {
      if (err) { return done(err); }
      if (!user) { 
        user = new User(parsedToken.payload.given_name,parsedToken.payload.family_name, parsedToken.payload.email);
        mysqluser.userSignUp(user, function (err, id) {
          if (err) { return done(err); }
          user.userid = id;
          return done(null, user);
        });
      } else {
        return done(null, user);
      }      
    });
  }
));

passport.use(new FacebookTokenStrategy({
    clientID: config.facebook.clientID,
    clientSecret: config.facebook.clientSecret,
  }, function(accessToken, refreshToken, profile, done) {
    console.log(profile);
    mysqluser.getUserByEmail(profile.emails[0].value, function (err, user) {
      if (err) { return done(err); }
      if (!user) { 
        console.log("User not found in database, creating new drivesense account.")
        user = new User(profile.name.given_name, profile.name.family_name, profile.emails[0].value);
        mysqluser.userSignUp(user, function (err, id) {
          if (err) { return done(err); }
          user.userid = id;
          return done(null, user);
        });
      } else {
        return done(null, user);
      }      
    });
  }
));


var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
opts.secretOrKey = 'secret';
opts.ignoreExpiration = true;
passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    mysqluser.getUserByID(jwt_payload.userid, function(err, user) {
        if (err) {
          return done(err, false);
        }
        if (user) {
          done(null, user);
        } else {
          console.log("JWT not authorized: " + jwt_payload);
          done(null, false);
        }
    });
}));

// Auth routes:

var signinstatus = function (req, res, next) {
  msg = {firstname: req.user.firstname, lastname: req.user.lastname};
  res.json(msg);
};

var signin = function (req, res, next) {
  var hasPassword = (req.user.password != null);
  var token = jwt.sign({userid:req.user.userid, firstname:req.user.firstname, lastname: req.user.lastname, email:req.user.email, hasPassword: hasPassword}, 'secret', {expiresIn: '10y'});
  msg = {token:token};
  res.json(msg);
};

var signup = function (req, res, next) {
  var query = req.body; 
  var user = new User();
  user.fromObject(query);
  user.password = bcrypt.hashSync(user.password);
  console.log("New signup: "+user.email);
  mysqluser.userSignUp(user,function(err, id) {
    if(err) {
      console.log(err.code);
      var msg = {};
      if(err.code == "ER_DUP_ENTRY") {
        res.status(400);
        msg = {status: 'fail', data: 'Duplicate signup for email '+user.email};
      } else {
        res.status(500);
        msg = {status: 'fail', data: 'unknown'}; 
      }
      res.json(msg);
    } else {
      //user has been populated with all info except for ID
      user.userid = id;
      req.user = user;
      next();
    }
  }); 
};

var changePassword = function(req, res, next) {
  var newPassword = req.body.newPassword;
  var oldPassword = req.body.oldPassword;
  var matches = false;
  if(oldPassword && req.user.password)
  {
    matches = bcrypt.compareSync(oldPassword, req.user.password);
  } else if(!oldPassword && !req.user.password) {
    //if no old password was provided and none is stored in the DB
    matches = true;
  }
  if(matches) {
    req.user.password = bcrypt.hashSync(newPassword);
    mysqluser.updateUserPassword(req.user, function(err) {
      if(err) {
        res.status(500);
        msg = {status: 'fail', data: err};
        res.json(msg);
      }
      res.json({status: "success"});
      next();
    })
  } else {
    res.status(400);
    res.json({status: "fail", data:"Old password was incorrect"});
    next();
  }
}

module.exports.changePassword = changePassword;
module.exports.passport = passport;
module.exports.signin = signin;
module.exports.signinstatus = signinstatus;
module.exports.signup = signup;