var app = angular.module('driveSenseApp', ['ui.router', 'auth', 'ui.bootstrap.datetimepicker']);

app.constant('API', 'http://drivesensetest.wirover.com:8000');

app.config(function($stateProvider) {
  var frontpageState = {
    name: 'frontpage',
    url:"",
    templateUrl: 'frontpage.template.html',
  }

  var myTripsState = {
    name: 'myTrips',
    url: '/mytrips',
    template: '<trip-component></trip-component>',
  }

  $stateProvider.state(frontpageState);
  $stateProvider.state(myTripsState);
});
