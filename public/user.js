
var showUserName = function() {
  var urlloginstatus = window.location.origin + "/signinstatus";
  $.get(urlloginstatus, function(msg) {
    if(msg.status == 'success') {
      var user = msg.data;
      document.getElementById("signinup").style.display="none";
      document.getElementById("username").style.display="block";
      document.getElementById("user").innerHTML = user.firstname + " " + user.lastname;
    } else {

    }
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


var validateSignInForm = function() {
  var email = document.forms["signinform"]["email"].value; 
  var password = document.forms["signinform"]["password"].value; 
   if(email == '' || password == '') {
    alert("Email and password cannot be empty");
    return null;
  }
  var signin = {
    email: email,
    password: password,
  };  
  return signin;
}


var submitSignIn = function() {

  var signin = validateSignInForm(); 
  if (signin == null) {
    return;
  } 

  var posturl = window.location.origin + "/signin";

  var signinpost = $.ajax({
    type: 'POST', 
    url: posturl, 
    data: signin,
  });
  signinpost.error(function() {
    alert("Sign In Failure");
  });
  signinpost.success(function(msg, status){
    if(status == "success") {
      console.log(msg);
      location.reload(); 
      window.location = window.location.origin + "/mytrips.html" 
    } else {
      console.log(status);
    } 
  }); 
}


var validateSignUpForm = function() {
  var firstname = document.forms["signupform"]["firstname"].value; 
  var lastname = document.forms["signupform"]["lastname"].value; 
  var email = document.forms["signupform"]["email"].value; 
  var password = document.forms["signupform"]["password"].value; 
  var repeat = document.forms["signupform"]["repeat"].value; 
  if(firstname == '' || lastname == '') {
    alert("Name cannot be empty");
    return null;
  } 
  if(email == '' || password == '' || repeat == '') {
    alert("Email and password cannot be empty");
    return null;
  }
  if(email.indexOf("@") == -1) {
    alert("Email format is incorrect");
    return null;
  }
  if(password != repeat) {
    alert("Passwords not match");
    return null;
  }
  var signup = {
    firstname: firstname,
    lastname: lastname,
    email: email,
    password: password,
    repeat: repeat
  };  
  return signup;
}

var submitSignUp = function() {

  var signup = validateSignUpForm(); 
  if (signup == null) {
    return;
  } 

  var posturl = window.location.origin + "/signup";

  var signuppost = $.ajax({
    type: 'POST', 
    url: posturl, 
    data: signup,
  });
  signuppost.error(function() {
    alert("Sign Up Failure");
  });
  signuppost.success(function(msg, status){
    if(status == "success") {
      if(msg.status == "success") {
        location.reload();
      } else {
        if(msg.data == "ER_DUP_ENTRY") {
          alert("Email has been registered");
        } else {
          alert("Unkown error");
        }
      }
    } else {
      alert("server failure, please try again later");
    } 
  }); 
}



