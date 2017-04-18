// Define the `auth` module
angular.module('auth', [])
.factory('authInterceptor',function(authService, API) {
  return {
    // automatically attach Authorization header
    request: function(config) {
      var token = authService.getToken();
      if(config.url.indexOf(API) === 0 && token) {
        config.headers.Authorization = 'JWT ' + token;
      }

      return config;
    },

    // If a token was sent back, save it
    response: function(res) {
      if(res.config.url.indexOf(API) === 0 && res.data.token) {
        authService.saveToken(res.data.token);
      }

      return res;
    }
  }
})
.service('authService', function($window) {
  var self = this;
  self.saveToken = function(token) {
    $window.localStorage['jwtToken'] = token;
  }

  self.getToken = function() {
    return $window.localStorage['jwtToken'];
  }
  self.parseJwt = function(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse($window.atob(base64));
  }
  self.isAuthed = function() {
    var token = self.getToken();
    if(token) {
      var params = self.parseJwt(token);
      return Math.round(new Date().getTime() / 1000) <= params.exp;
    } else {
      return false;
    }
  }
})
.service('userService', function($http, $window, API, authService) {
  var self = this;
  self.login = function(email, password) {
    return $http.post(API + '/auth/signin', {
      email: email,
      password: password
    })
  };
  self.signup = function(firstname, lastname, email, password) {
    return $http.post(API + '/auth/signup', {
      firstname: firstname,
      lastname: lastname,
      email: email,
      password: password
    })
  }
  self.changePassword = function(oldPassword, newPassword) {
    return $http.post(API + '/auth/changepassword', {
      oldPassword: oldPassword,
      newPassword: newPassword
    })
  }
  self.googleLogin = function(googleToken) {
    return $http.post(API + '/auth/google', {
        id_token: googleToken
      })
  };
  self.logout = function() {
    $window.localStorage.removeItem('jwtToken');
  }
  self.userInfo = function() {
    var token = authService.getToken();
    if(token) {
      var params = authService.parseJwt(token);
      return {firstname:params.firstname, lastname:params.lastname, email:params.email};
    }
    return null;
  }
})
.config(function($httpProvider) {$httpProvider.interceptors.push('authInterceptor')});