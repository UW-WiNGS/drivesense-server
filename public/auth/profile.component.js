angular.
  module('auth').
  component('profileComponent', {
    templateUrl: 'auth/profile.template.html',
    controller: function ProfileController(authService, userService, $state) {
      this.user = function() {
        return userService.userInfo();
      }
    }
  });