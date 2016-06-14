var path = require('path');     //used for file path
var mysqlwrapper = require('./mysql_wrapper.js');
var User = require('./user.js');
var fs = require('fs-extra');
var jwt = require('jsonwebtoken');
var util = require('util');
var formidable = require('formidable');
var sqlite3 = require('sqlite3').verbose();

var showtrips = function (req, res, next) {
  var userid = req.body.userid;
  var dir = path.join(__dirname, "../uploads/" + userid + "/");
  try {
    var files = fs.readdirSync(dir);
  } catch(err) {
    var msg = {status: 'fail', data: err};
    res.json(msg);
    return;
  }
  var trips = {};
  var index = 0;
  var len = files.length;
  (function loadTrip() {
    var dbfile = dir + files[index];
    if(index == len) {
      var msg = {status: 'success', data:trips};
      res.json(msg);
      return;
    }
    try {
      var db = new sqlite3.Database(dbfile);
      db.all("select * from gps;", function(err, rows) {
        if (err) { 
          console.log(err); 
        } else {
          trips[files[index]] = rows;
          index++;
          loadTrip();
        }
      });
    } catch (exception) {
      console.log(exception);
      var msg = {status: 'fail', data: exception};
      res.json(msg);     
      return;
    }
  })();

};


var signout = function(req, res, next) {
  res.clearCookie('token');
  var msg = {status:'success', data:'token cleared'};
  res.json(msg);
};


var signinstatus = function (req, res, next) {
  var user = req.body;
  var msg = {status: 'success', data: {firstname: user.firstname, lastname:user.lastname}};
  res.json(msg);
};


var tokenverification = function (req, res, next) {
   var token = req.cookies.token || req.body.token || req.query.token || req.headers['x-access-token'];
  // decode token
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, 'secret', function(err, decoded) {      
      if (err) {
        var msg = {status: 'fail', data: 'Failed to authenticate token.'};    
        res.json(msg);
      } else {
        // if everything is good, save to request for use in other routes
        req.body = decoded;    
        next(); 
      }
    });

  } else {
    // if there is no token
    // return an error
    return res.status(403).send({ 
        status: 'fail', 
        data: 'No token provided.' 
    }); 
  }
};

var signin = function (req, res, next) {
  var user = new User();
  user.fromObject(req.body);
  mysqlwrapper.userSignIn(user, function(err, row) {
    var msg = {};
    if(err) {
      console.log(err);
      msg = {status: 'fail', data: err};
    } else {
      var token = jwt.sign(row, 'secret', {expiresIn: '1d'});
      res.cookie('token', token);
      msg = {status: 'success', data: {firstname: row.firstname, lastname: row.lastname}};
    }
    res.json(msg);
  });
};



var signup = function (req, res, next) {
  var query = req.body; 
  var user = new User();
  user.fromObject(query);
  console.log(user);
  mysqlwrapper.userSignUp(user,function(err, id) {
    if(err) {
      console.log(err);
      var msg = {status: 'fail', data: err};
      res.json(msg);
    } else {
      var token = jwt.sign(row, 'secret', {expiresIn: '1d'});
      res.cookie('token', token);
      var msg = {status: 'success', data: {firstname: user.firstname, lastname:user.lastname}};
      res.json(msg);
    }
  }); 
};


var androidsignin = function(req, res, next) {
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    var user = fields;     
    mysqlwrapper.userSignIn(user, function(err) {
      if(err) {
        var msg = {status: 'fail', data: err};         
      } else {
        var msg = {status: 'success', data: null};
      }
      res.json(msg);
    });
  });
}  


var androidsignup = function(req, res, next) {
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    var user = fields;     
    mysqlwrapper.userSignUp(user, function(err, id) {
     if(err) {
        var msg = {status: 'fail', data: err};         
      } else {
        var msg = {status: 'success', data: null};
      }
      res.json(msg);
    });
  });
};  

var upload = function (req, res, next) {
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    var file = files.uploads;
    mysqlwrapper.getUserIDByEmail(fields.email, function(err, id){
      if(err) {
        console.log(err);
        var msg = {status: 'fail', data: err};
        res.json(msg);
        return;
      } 
      var folder = path.join(__dirname, '../uploads/' + id + '/');
      fs.mkdirp(folder, function (err) {
        if(err) {
          console.log(err);
          var msg = {status: 'fail', data: err};
          res.json(msg);
          return;
        }
        fs.copy(file.path, path.join(folder, file.name), function(err){
          if (err) {
            console.error(err);
            var msg = {status: 'fail', data: err};
            res.json(msg);
          } else {
            var msg = {status: 'success', data: ''};
            res.json(msg);
          } 
        }); 
      });
    });
  });//end of paring form
}



module.exports.upload = upload;

module.exports.showtrips = showtrips;
module.exports.signup = signup;
module.exports.signin = signin;
module.exports.signout = signout;

module.exports.signinstatus = signinstatus;
module.exports.tokenverification = tokenverification;

module.exports.androidsignin = androidsignin;
module.exports.androidsignup = androidsignup;





