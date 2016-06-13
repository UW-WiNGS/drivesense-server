var path = require('path');     //used for file path
var mysqlwrapper = require('./mysql_wrapper.js');
var User = require('./user.js');
var fs = require('fs-extra');
var jwt = require('jsonwebtoken');

var signinstatus = function (req, res, next) {
  console.log("signin status");
  var token = req.cookies.token || req.body.token || req.query.token || req.headers['x-access-token'];
  // decode token
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, 'secret', function(err, decoded) {      
      if (err) {
        var msg = {status: 'fail', message: 'Failed to authenticate token.'};    
        res.json(msg);
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;    
        console.log(decoded);
        var msg = {status: 'success', message: ''};
        res.json(msg);
      }
    });

  } else {
    // if there is no token
    // return an error
    return res.status(403).send({ 
        status: 'fail', 
        message: 'No token provided.' 
    });
    
  }
};

var test = function (req, res, next) {
  console.log("test");
  next();
};

var signin = function (req, res, next) {
  console.log("signin");
  var user = new User();
  user.fromObject(req.body);
  mysqlwrapper.userSignIn(user, function(err) {
    var msg = {};
    if(err) {
      console.log(err);
      msg = {status: 'fail', data: err};
    } else {
      var token = jwt.sign(user, 'secret', {expiresIn: '1d'});
      res.cookie('token', token);
      msg = {status: 'success', data: user, token: token};
    }
    res.json(msg);
  });
};


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


var signup = function (req, res, next) {
  var query = req.body; 
  var user = new User();
  user.fromObject(query);
  console.log(user);
  mysqlwrapper.insertUser(user,function(err, id) {
    if(err) {
      console.log(err);
      var msg = {status: 'fail', data: err};
      res.json(msg);
    } else {
      var msg = {status: 'success', data: null};
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

module.exports.signinstatus = signinstatus;
module.exports.test = test;

module.exports.androidsignin = androidsignin;
module.exports.androidsignup = androidsignup;





