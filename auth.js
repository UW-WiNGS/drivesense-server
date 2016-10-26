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

passport.use(new LocalStrategy({
        usernameField: 'email'
    },
    function(email, password, done) {
      mysqluser.userSignIn(email, password, function(err, user) {
          if (err) { return done(err); }
          if (!user) { return done(null, false, { message: 'Incorrect username or password.' }); }
          return done(null, user);
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
    mysqluser.getUserByEmail(profile.emails[0], function (err, user) {
      if (err) { return done(err); }
      if (!user) { 
        user = new User(profile.name.given_name, profile.name.family_name, profile.emails[0]);
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
passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    mysqluser.getUserByID(jwt_payload.userid, function(err, user) {
        if (err) {
            return done(err, false);
        }
        if (user) {
            done(null, user);
        } else {
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
  var token = jwt.sign({userid:req.user.userid, firstname:req.user.firstname, lastname: req.user.lastname}, 'secret', {expiresIn: '1d'});
  msg = {token:token};
  res.json(msg);
};

var signup = function (req, res, next) {
  var query = req.body; 
  var user = new User();
  user.fromObject(query);
  console.log(user);
  mysqluser.userSignUp(user,function(err, id) {
    if(err) {
      console.log(err.code);
      var msg = {};
      if(err.code == "ER_DUP_ENTRY") {
        msg = {status: 'fail', data: err.code};
      } else {
        msg = {status: 'fail', data: 'unknown'}; 
      }
      res.json(msg);
    } else {
      user.userid = id;
      req.user = user;
      next();
    }
  }); 
};

module.exports.passport = passport;
module.exports.signin = signin;
module.exports.signinstatus = signinstatus;
module.exports.signup = signup;