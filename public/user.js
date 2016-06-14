
var showUserName = function() {
  var urlloginstatus = window.location.origin + "/signinstatus";
  $.get(urlloginstatus, function(msg) {
    var user = msg.data;
    document.getElementById("signinup").style.display="none";
    document.getElementById("username").style.display="block";
    document.getElementById("user").innerHTML = user.firstname + " " + user.lastname;
  });
}


var logout = function() {
  var urllogout = window.location.origin + "/signout";
  $.get(urllogout, function(data) {
    if(data.status == 'success') {
      location.reload();  
    } else {
      alert("Log Out Failed");
    }
  });
}
