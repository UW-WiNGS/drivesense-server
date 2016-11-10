angular.
  module('driveSenseApp')
  .service('tripformat', function () { //TODO this can be refactored out of a service
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
  })
  .component('tripComponent', {
    templateUrl: 'mytrips/mytrips.template.html',
    controller: function($scope, $http, tripformat, API) {
      var self = this;

      self.showTrip = function() {
        var method = self.radioValue;
        displayTrip(self.curtrip, method); 
      };

      self.search = function(date) {
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
            self.trips = tripformat.getTrips();       
            self.setClickedRow(0); 
            self.onTimeSet(date, next);
          } else {
            alert("search failed on the server, try again later!");
          } 
        });  
      };

     self.init = function() {
        self.radioValue = "speed";
        self.slider = {
          options: {
            translate: function(value) {
              return ((value-self.slider.options.floor)/(60.0*1000)).toFixed(1);
            },
            onEnd:self.showTrip,
            showTicksValues:1000*60,
          }
        };
        var date = new Date();
        var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        self.dateDropDownInput = firstDay;
        self.dateDropDownDisplay = (date.getMonth() + 1) + "/" + date.getFullYear();
        self.search(firstDay);
        initMap();
      };
      self.init();


      self.onTimeSet = function(date, oldDate) {
        self.dateDropDownInput = date;
        self.dateDropDownDisplay = (date.getMonth() + 1) + "/" + date.getFullYear();
      };

      self.searchLastMonth = function() {
        var date = self.dateDropDownInput;
        var last;  
        if (date.getMonth() == 0) {
          last = new Date(date.getFullYear() - 1, 12, 1);
        } else {
          last = new Date(date.getFullYear(), date.getMonth() - 1, 1);
        } 
        self.search(last);
      }

      self.searchNextMonth = function() {
        var date = self.dateDropDownInput;
        var next;  
        if (date.getMonth() == 11) {
          next = new Date(date.getFullYear() + 1, 0, 1);
        } else {
          next = new Date(date.getFullYear(), date.getMonth() + 1, 1);
        }
        self.search(next);
      }

     
      self.setClickedRow = function(index){
        self.selectedRow = index;
        self.curtrip = self.trips[index];  
        console.log(index + " is clicked");
        self.showTrip();
      }
      self.removeTrip = function(index) {
        var deletetrip = confirm('Are you sure you want to delete (unrecoverable)?');
        if (!deletetrip) {
          return; 
        }  
        $http({
            url: API + '/removetrip',
            method: "POST",
            data: { 'tripid' : self.trips[index].tripid }
        }).then(function(res) {
          if(res.data.status == "success") {
            //delete locally
            self.trips.splice(index, 1);    
            var len = Object.keys(self.trips).length;
            self.curtrip = self.trips[index%len];  
            self.showTrip();
            self.setClickedRow(index%len);
          } else {
            alert("delete failed on the server, try again later!");
          } 
        });  
      } 
      function initMap() {
        var madison = {lat: 43.073052, lng: -89.401230};
        self.map = new google.maps.Map(document.getElementById('map'), { zoom: 15, center: madison});
        self.mapOverlays = [];
      }

      function displayTrip(trip, method) {
        if(!trip) return null;
        console.log( trip);

        self.slider.options.floor=trip.gps[0].time,
        self.slider.options.ceil=trip.gps[trip.gps.length-1].time,

        showLegend(method);

        var filteredtrip = trip.gps.filter(function(point, index) {return (point.time >= trip.starttime && point.time <= trip.endtime)});

        drawChart(filteredtrip,method);

        var latlngbounds = new google.maps.LatLngBounds();
        var len = trip.gps.length;

        //clear all circles and markers from the map
        while(self.mapOverlays[0])
        {
          var tmp = self.mapOverlays.pop();
          tmp.setMap(null);
        }

        var colors = ['green', 'lightgreen', 'yellow', 'orange', 'red'];

        var len = filteredtrip.length;
        var rate = parseInt(len/600) + 1;
        for(var i = 0; i < len; i += rate) {
          var point = filteredtrip[i];
          var latlng = new google.maps.LatLng(point.lat, point.lng);
          latlngbounds.extend(latlng);
          
          var index = 0;
          var speed = point.curspeed * 2.23694;
          var score = point.curscore;
          var brake = point.curevent;
          var tilt = point.curtilt;
          if(method == "speed") {
            index = Math.round(speed/10.0);
          } else if(method=="score") {
            index = Math.round(score/2.0);
          } else if(method=="brake") {
            if(brake < 0) index = 3;
            else index = 0;
          } else if(method=="tilt") {
            if(tilt < -5) index = 0;
            else if(tilt < -1) index = 1;
            else if(tilt > 5) index = 4;
            else if(tilt > 1) index = 3;
            else index = 2;
          } else {
            console.log("unknown method:" + method);
          }
          if(index >= colors.length) {
            index = colors.length - 1; 
          }
          if(isNaN(index)) {
            index = 0; 
            console.log("index calculation error");
          }
          if (i==0) {
            var marker_icon = 'img/starticon.png' 
            self.mapOverlays.push(new google.maps.Marker({
              position: latlng,
              map: self.map,
              icon: marker_icon
            }));
          }
          if (i==len-1) {
            var marker_icon = 'img/stopicon.png'
            self.mapOverlays.push(new google.maps.Marker({
              position: latlng,
              map: self.map,
              icon: marker_icon
            }));
          }
          self.mapOverlays.push(new google.maps.Circle({
            strokeOpacity: 0,
            fillColor: colors[index],
            fillOpacity: 1,
            map: self.map,
            center: latlng,
            radius: 20
          }));

        
        }
        self.map.fitBounds(latlngbounds);
      }



      function drawChart(data, method) {
        var len = data.length;
        var data_list = [];
        var init_time = parseFloat(data[0].time);
        var rate = parseInt(len/600) + 1;
        for(var i = 0; i < len; i+=rate){
          var point = data[i];
          var current_time = parseFloat(point.time);
          var time = (current_time - init_time)/60000.0;
          var chart_type;
          var y_axis_text;
          var title_text;
          if(method == "speed") {
            data_list.push([time, point.curspeed * 2.23694]);
            title_text = "Speed";
            y_axis_text = "Speed (mph)";
            chart_type = "line";
          } else if(method=="score") {
            title_text = "Score";
            y_axis_text = "Score";
            chart_type = "line";
            data_list.push([time, point.curscore]);
          } else if(method=="brake") {
            title_text = "Brakes";
            y_axis_text = "Braking";
            chart_type = "scatter";
            data_list.push([time, point.curevent * -1]);
          } else if(method=="tilt") {
            title_text = "Tilt";
            y_axis_text = "Tilt (Degree)";
            chart_type = "line";
            data_list.push([time, point.curtilt]);
          } else {
            console.log("unknown method:" + method);
          }
        } 
        $('#chart').highcharts({
          turboThreshold:10000,
          legend: {
              enabled: false
          },
          credits: {
              enabled: false
          },
          chart: {
              type: chart_type,
          },
          title: {
              text: title_text
          },
          xAxis: {
              title: {
                  text: 'Time (minutes)'
              }
          },
          yAxis: {
             title: {
                  text: y_axis_text
              }
          },
          series: [{
              data: data_list
          }]
        });
      }


      function showLegend(method) {
        if(method == "speed") {
          $("#legend-med").parent().show()
          $("#legend-medhigh").parent().show()
          $("#legend-medlow").parent().show()
          $("#legend-type").html("Speed");
          $("#legend-high").html(">40mph");
          $("#legend-medhigh").html("30-40mph");
          $("#legend-med").html("20-30mph");
          $("#legend-medlow").html("10-20mph");
          $("#legend-low").html("0-10mph");
        } else if(method=="score") {
          $("#legend-med").parent().show()
          $("#legend-medhigh").parent().show()
          $("#legend-medlow").parent().show()
          $("#legend-type").html("Score");
          $("#legend-high").html("9-10");
          $("#legend-medhigh").html("7-8");
          $("#legend-med").html("5-6");
          $("#legend-medlow").html("3-4");
          $("#legend-low").html("1-2");
        } else if(method=="brake") {
          $("#legend-med").parent().hide()
          $("#legend-medhigh").parent().hide()
          $("#legend-medlow").parent().hide()
          $("#legend-type").html("Brake");
          $("#legend-high").html("Braking");
          $("#legend-low").html("Not braking");
        } else if(method=="tilt") {
          $("#legend-med").parent().show()
          $("#legend-medhigh").parent().show()
          $("#legend-medlow").parent().show()
          $("#legend-type").html("Tilt");
          $("#legend-high").html("-5 ~ -10 \xB0");
          $("#legend-medhigh").html("-1 ~ -5 \xB0");
          $("#legend-med").html("-1 ~ 1 \xB0");
          $("#legend-medlow").html("1 ~ 5 \xB0");
          $("#legend-low").html("5 ~ 10 \xB0"); 
        } else {
          console.log("unknown method:" + method);
        }
      }

    }
  });