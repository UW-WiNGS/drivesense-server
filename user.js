
function User(firstname, lastname, email, userid, password) {
    this.firstname = firstname;
    this.lastname = lastname;
    this.email = email;
    this.password = password;
    this.userid = userid;
}

User.keys = ['firstname', 'lastname', 'email', 'password', 'userid'];

User.prototype.fromObject = function(uobj) {
  var keys = User.keys;
  for (var i = 0; i < keys.length; ++i) {
    var key = keys[i];
    this[key] = uobj[key];
  }
}

module.exports = User;

