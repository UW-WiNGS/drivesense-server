var path = require('path');     //used for file path
var mysqlwrapper = require('./mysql_wrapper.js');
var User = require('./user.js');
var fs = require('fs-extra');
var jwt = require('jsonwebtoken');

var getUserID = function (req, res, next) {
  req.pipe(req.busboy);
  var result = {};
  req.busboy.on('field', function(fieldname, val) {
    result[fieldname] = val;
    if(filedname == "email") {
      mysqlwrapper.getUserIDByEmail(val, function(err, id){
        if(err) {
          console.log(err);
        } else {
          req.userid = id;
          next();
        }
      });
    }
  });   
}

var upload = function (req, res, next) {
  req.pipe(req.busboy);
  var result = {};
  req.busboy.on('field', function(fieldname, val) {
    result[fieldname] = val;
  });  
  req.busboy.on('file', function (fieldname, file, filename) {  
    console.log("Uploading: " + filename);
    console.log(result);
    var folder = path.join(__dirname, '../uploads/' + result['deviceid'] + '/');
    fs.mkdirp(folder, function (err) {
      var fstream = fs.createWriteStream(folder + filename);
      file.pipe(fstream);
      fstream.on('close', function () {    
        console.log("Upload Finished of " + filename);              
        res.send('okay');           //where to go next
      });
    });
  });
};


var showtrip = function (req, res, next) {
  var query = req.query;
  var devid = query.devid;
  var tripid = query.tripid;
  var dir = path.join(__dirname, "../uploads/" + devid + "/");
  try {
    var files = fs.readdirSync(dir);
    var dbfile = dir + files[tripid];
    var db = new sqlite3.Database(dbfile);
  } catch(err) {
    var msg = {status: 'err', data: err};
    res.json(msg);
    return;
  }
  db.all("SELECT * FROM gps;", function(err, rows) {
    if(err) {
      var msg = {status: 'err', data: err};
      res.json(msg);
    } else {
      var msg = {status: 'okay', data: rows};
      res.json(msg);
    }
  });
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
  console.log("signin");
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
  req.pipe(req.busboy);
  var user = {};
  req.busboy.on('field', function(fieldname, val) {
    user[fieldname] = val;
  });
  req.busboy.on('finish', function() {
    mysqlwrapper.userSignIn(user, function(err) {
      if(err) {
        var msg = {status: 'err', data: err};         
      } else {
        var msg = {status: 'okay', data: null};
      }
      res.json(msg);
    });
  });
};  


var androidsignup = function(req, res, next) {
  req.pipe(req.busboy);
  var user = {};
  req.busboy.on('field', function(fieldname, val) {
    user[fieldname] = val;
  });
  req.busboy.on('finish', function() {
    mysqlwrapper.userSignUp(user, function(err, id) {
     if(err) {
        var msg = {status: 'err', data: err};         
      } else {
        var msg = {status: 'okay', data: null};
      }
      res.json(msg);
    });
  });
};  


 
module.exports.upload = upload;
module.exports.showtrip = showtrip;
module.exports.signup = signup;
module.exports.signin = signin;
module.exports.signout = signout;

module.exports.signinstatus = signinstatus;
module.exports.tokenverification = tokenverification;

module.exports.androidsignin = androidsignin;
module.exports.androidsignup = androidsignup;





