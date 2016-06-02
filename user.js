function user(uobj) {
  var keys = {'firstname', 'lastname', 'email', 'password'};
  var values = [];
  for (var key in keys) {
    values[key] = uobj[key];
  }
}

module.exports = user;

