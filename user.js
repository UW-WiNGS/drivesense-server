
function User() {
}

User.keys = ['firstname', 'lastname', 'email', 'password'];

User.prototype.fromObject = function(uobj) {
  var keys = User.keys;
  for (var i = 0; i < keys.length; ++i) {
    var key = keys[i];
    this[key] = uobj[key];
  }
}

module.exports = User;

