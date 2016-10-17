
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
      window.localStorage['jwtToken'] = msg.data.token;
      // location.reload(); 
      // window.location = window.location.origin + "/mytrips.html" 
    } else {
      console.log(status);
    } 
  }); 
}
function onGoogleSigninSuccess(googleUser) {
  console.log('Logged in as: ' + googleUser.getBasicProfile().getName());
  console.log("ID: " + googleUser.getBasicProfile().getId()); // Don't send this directly to your server!
    // console.log('Full Name: ' + profile.getName());
    // console.log('Given Name: ' + profile.getGivenName());
    // console.log('Family Name: ' + profile.getFamilyName());
    // console.log("Image URL: " + profile.getImageUrl());
    // console.log("Email: " + profile.getEmail());

    // // The ID token you need to pass to your backend:
    var id_token = googleUser.getAuthResponse().id_token;
    console.log("ID Token: " + id_token);
    
}
function onGoogleFailure(error) {
  console.log(error);
}
function renderButton() {
  gapi.signin2.render('my-signin2', {
    'scope': 'profile email',
    'width': 240,
    'height': 50,
    'longtitle': true,
    'theme': 'dark',
    'onsuccess': onGoogleSigninSuccess,
    'onfailure': onGoogleFailure
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



