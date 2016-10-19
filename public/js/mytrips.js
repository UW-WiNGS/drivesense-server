var app = angular.module('displayTripsApp', ['auth','ui.bootstrap.datetimepicker'])
  .constant('API', 'http://drivesensetest.wirover.com:8000');

function timeStamp(now) {
// Create an array with the current month, day and time
  var date = [ now.getMonth() + 1, now.getDate(), now.getFullYear() ];
// Create an array with the current hour, minute and second
  var time = [ now.getHours(), now.getMinutes()];
// Determine AM or PM suffix based on the hour
  var suffix = ( time[0] < 12 ) ? "AM" : "PM";
// Convert hour from military time
  time[0] = ( time[0] < 12 ) ? time[0] : time[0] - 12;
// If hour is 0, set it to 12
  time[0] = time[0] || 12;
// If seconds and minutes are less than 10, add a zero
  for ( var i = 1; i < 3; i++ ) {
    if ( time[i] < 10 ) {
      time[i] = "0" + time[i];
    }
  }
// Return the formatted string
  return date.join("/") + " " + time.join(":") + " " + suffix;
}

app.service('tripformat', function () {
  var trips = [];
  this.getTrips = function() {
    return trips;
  }
  this.getTrip = function(key) {
    return trips[key];
  }
  this.getKeys = function() {
    return Object.keys(trips);
  } 
  this.setData = function(value) {
    trips = [];
    var len = Object.keys(value).length;
    var i = len - 1;
    for(var tripid in value) {
      var trip = value[tripid]; 
      trip.tripid = tripid;
      var time = new Date(trip.starttime);
      trip.displaytime = timeStamp(time); 
      trips[i--] = trip; 
    }
  }
});



app.controller('displayTripsCtrl', function($scope, $http, tripformat, API){ 
  $scope.showTrip = function() {
    var method = $scope.radioValue;
    displayTrip($scope.curtrip, method); 
  };

  $scope.search = function(date) {
    var next;
    if (date.getMonth() == 11) {
      next = new Date(date.getFullYear() + 1, 0, 1);
    } else {
      next = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    }
    console.log("search from:" + date.getTime() + " to:" + next.getTime());
    $http({
      url: API + '/searchtrips',
      method: "POST",
      data: {'start':date.getTime(), 'end':next.getTime() }
    }).then(function(res) {
      if(res.data.status == "success") {
        tripformat.setData(res.data.data);
        $scope.trips = tripformat.getTrips();       
        $scope.setClickedRow(0); 
        $scope.onTimeSet(date, next);
      } else {
        alert("search failed on the server, try again later!");
      } 
    });  
  };

 $scope.init = function() {
    $scope.radioValue = "speed";
    var date = new Date();
    var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    $scope.dateDropDownInput = firstDay;
    $scope.dateDropDownDisplay = (date.getMonth() + 1) + "/" + date.getFullYear();
    $scope.search(firstDay);
  };
  $scope.init();


  $scope.onTimeSet = function(date, oldDate) {
    $scope.dateDropDownInput = date;
    $scope.dateDropDownDisplay = (date.getMonth() + 1) + "/" + date.getFullYear();
  };

  $scope.searchLastMonth = function() {
    var date = $scope.dateDropDownInput;
    var last;  
    if (date.getMonth() == 0) {
      last = new Date(date.getFullYear() - 1, 12, 1);
    } else {
      last = new Date(date.getFullYear(), date.getMonth() - 1, 1);
    } 
    $scope.search(last);
  }

  $scope.searchNextMonth = function() {
    var date = $scope.dateDropDownInput;
    var next;  
    if (date.getMonth() == 11) {
      next = new Date(date.getFullYear() + 1, 0, 1);
    } else {
      next = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    }
    $scope.search(next);
  }

 
  $scope.setClickedRow = function(index){
    $scope.selectedRow = index;
    $scope.curtrip = $scope.trips[index];  
    console.log(index + " is clicked");
    $scope.showTrip();
  }
  $scope.removeTrip = function(index) {
    var deletetrip = confirm('Are you sure you want to delete (unrecoverable)?');
    if (!deletetrip) {
      return; 
    }  
    $http({
        url: API + '/removetrip',
        method: "POST",
        data: { 'tripid' : $scope.trips[index].tripid }
    }).then(function(res) {
      if(res.data.status == "success") {
        //delete locally
        $scope.trips.splice(index, 1);    
        var len = Object.keys($scope.trips).length;
        $scope.curtrip = $scope.trips[index%len];  
        $scope.showTrip();
        $scope.setClickedRow(index%len);
      } else {
        alert("delete failed on the server, try again later!");
      } 
    });  
  } 

});

