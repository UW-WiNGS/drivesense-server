var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var GoogleTokenStrategy = require('passport-google-id-token');
var mysqluser = require('./mysql_user.js');
var User = require('./user.js');

passport.use(new LocalStrategy({
        usernameField: 'email',
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
    clientID: "83228343356-ooeejimtmb7cn3bsnkr06ve67nip7e6o.apps.googleusercontent.com",
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

passport.serializeUser(function(user, done) {
  done(null, user.userid);
});

passport.deserializeUser(function(id, done) {
  mysqluser.getUserByID(id, function(err, user) {
    done(err, user);
  });
});

module.exports.passport = passport;