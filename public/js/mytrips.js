var app = angular.module('displayTripsApp', ['ui.bootstrap.datetimepicker']);
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
    var len = Object.keys(value).length;
    var i = len - 1;
    for(var tripid in value) {
      var trip = value[tripid]; 
      trip.tripid = tripid;
      var time = new Date(trip.starttime);
      var postfix = "am";
      if(time.getHours() >= 12) postfix = "pm";
      trip.displaytime = (time.getMonth() + 1) + "/" + time.getDate() + "-" + time.getHours() + ":" + time.getMinutes() + postfix;
      trips[i--] = trip; 
    }
  }
});


app.controller('displayTripsCtrl', function($scope, $http, tripformat){ 
  $http.get("/mytrips").then(function(res){
    if(res.status == 200) {
      var response = res.data;
      if(response.status == "fail") {
        return;
      }
      tripformat.setData(response.data);
      $scope.trips = tripformat.getTrips();       
      $scope.curtrip = $scope.trips[0];  
      $scope.showTrip($scope.curtrip);
      $scope.setClickedRow(0);
   }
  });
  $scope.showTrip = function($curtrip) {
    var method = $scope.radioValue;
    displayTrip($curtrip, method); 
  };
  $scope.radioValue = "speed";


  $scope.setClickedRow = function(index){
    $scope.selectedRow = index;
  }

  $scope.removeTrip = function(index) {
    var deletetrip = confirm('Are you sure you want to delete (unrecoverable)?');
    if (!deletetrip) {
      return; 
    }  
    $http({
        url: '/removetrip',
        method: "POST",
        data: { 'tripid' : $scope.trips[index].tripid }
    }).then(function(res) {
      if(res.data.status == "success") {
        //delete locally
        $scope.trips.splice(index, 1);    
        var len = Object.keys($scope.trips).length;
        $scope.curtrip = $scope.trips[index%len];  
        $scope.showTrip($scope.curtrip);
        $scope.setClickedRow(index%len);
      } else {
        alert("delete failed on the server, try again later!");
      } 
    });  
  } 

});

