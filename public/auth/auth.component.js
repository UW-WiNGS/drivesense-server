// Register `phoneList` component, along with its associated controller and template
angular.
  module('auth').
  component('auth', {
    templateUrl: 'auth/auth.template.html',
    controller: function AuthController(authService, userService) {
      var auth2;
      gapi.load('auth2', function() {
        auth2 = gapi.auth2.init();
      });
      //this.googleAuth = gapi.auth2.init();
      this.isAuthed = function() {
        return authService.isAuthed ? authService.isAuthed() : false
      }
      this.logout = function() {
        userService.logout && userService.logout();
        if(auth2) {
          auth2.signOut().then(function () {
            console.log('User signed out.');
          });
        }
      }
      function onGoogleSigninSuccess(googleUser) {
          var id_token = googleUser.getAuthResponse().id_token;
          userService.googleLogin(id_token).then(null, handleFailure);
      }
      function onGoogleFailure(error) {
        console.log(error);
      }
      function renderGoogleButton(id) {
        gapi.signin2.render(id, {
          'scope': 'profile email',
          'width': 240,
          'height': 50,
          'longtitle': true,
          'theme': 'dark',
          'onsuccess': onGoogleSigninSuccess,
          'onfailure': onGoogleFailure
        });
      }
      function handleFailure(res) {
        alert("DriveSense login failed.");
      }
      function closeSignin() {
        $('#signin').modal('hide')
      }
      function closeSignup() {
        $('#signup').modal('hide')
      }
      this.showSignin = function() {
        renderGoogleButton('signin-google');
      }
      this.showSignup = function() {
        renderGoogleButton('signup-google');
      }
      this.login = function() {
        userService.login(this.email, this.password)
          .then(closeSignin, handleFailure);
      }
      this.signupinfo = {};
      this.signup = function(){
        if(this.signupinfo.email && this.signupinfo.password && this.signupinfo.repeat == this.signupinfo.password) {
          userService.signup(this.signupinfo.firstname, this.signupinfo.lastname, this.signupinfo.email, this.signupinfo.password)
          .then(closeSignup, handleFailure);
        } else {
          alert("Signup form validation error.")
        }
      }
      this.user = function() {
        return userService.userInfo();
      }
    }
  });