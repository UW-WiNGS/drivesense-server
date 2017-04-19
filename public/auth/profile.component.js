angular.
  module('auth').
  component('profileComponent', {
    templateUrl: 'auth/profile.template.html',
    controller: function ProfileController(authService, userService, $state) {
      this.passwordChange = {};
      this.preferences = {
        units: "imperial",
        share_data: true
      };
      this.changePassword = function() {
        if(this.passwordChange.newPassword && this.passwordChange.repeatNewPassword && (this.passwordChange.newPassword == this.passwordChange.repeatNewPassword)) {
          userService.changePassword(this.passwordChange.password, this.passwordChange.newPassword)
          .then(function() { alert("Password change succeeded.")}, 
            function(res) { alert("Password change request failed. Make sure you entered your old password correctly. (HTTP "+res.status+")")});
        } else {
          alert("Error: New passwords must match.")
        }
        
      }
      this.user = function() {
        return userService.userInfo();
      }
    }
  });