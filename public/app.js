var app = angular.module('driveSenseApp', ['ui.router', 'auth', 'ui.bootstrap.datetimepicker', 'rzModule']);

app.constant('API', 'http://drivesense.io');

app.config(function($stateProvider, $urlRouterProvider) {
  var frontpageState = {
    name: 'frontpage',
    url:"/",
    templateUrl: 'frontpage.template.html',
  }

  var myTripsState = {
    name: 'myTrips',
    url: '/mytrips',
    template: '<trip-component></trip-component>',
  }

  var userProfileState = {
    name: 'profile',
    url: '/profile',
    template: '<profile-component></profile-component>',
  }

  $stateProvider.state(frontpageState);
  $stateProvider.state(myTripsState);
  $stateProvider.state(userProfileState);
  $urlRouterProvider.when('', '/');
});
