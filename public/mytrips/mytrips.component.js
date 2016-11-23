angular.
  module('driveSenseApp')
  .service('tripService', function ($http, API, $q) { //TODO this can be refactored out of a service
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
    this.deleteTrip = function(index) {
      trips.splice(index, 1);  
    }
    this.setData = function(value) {
      trips = [];
      var len = Object.keys(value).length;
      var i = 0;
      for(var guid in value) {
        var trip = value[guid]; 
        if(!trip.starttime) {
          trip.starttime=trip.data_starttime;
        }
        if(!trip.endtime) {
          trip.endtime=trip.data_endtime;
        }
        
        var time = new Date(trip.starttime);
        trip.displaytime = moment(trip.starttime).format('MMM Do, h:mma');
        trip.displayduration = function() {
          var date = new Date(null);
          date.setSeconds((this.endtime - this.starttime)/1000); // specify value for SECONDS here
          return date.toISOString().substr(11, 8);
        }
        trips[i] = trip; 
        i+=1;
      }
    }
    //Returns a promise for when the trip is populated
    this.getTripGPS = function(trip, start) {
      return $http({
          url: API + '/tripTraces',
          method: "POST",
          data: {'start':start, 'type':'Trip', 'guid':trip.guid }
      }).then(function(res) {
        console.log("Loaded "+res.data.length+" rows of new trip data for "+trip.guid)
        if(res.data.length > 0) {
          trip.data_endtime = res.data[res.data.length-1].time
          trip.endtime = trip.data_endtime;
          if(!trip.gps){
            trip.gps = res.data;
          } else {
            trip.gps = trip.gps.concat(res.data);
          }        
        }
        return res.data;
      });
    }
    this.updateTrip = function(trip) {
      return $http({
          url: API + '/updateTrip',
          method: "POST",
          data: {'guid':trip.guid }
      }).then(function(res) {
        console.log(res.data);
        Object.assign(trip, res.data);
        return trip;
      });
    }
  })
  .component('tripComponent', {
    templateUrl: 'mytrips/mytrips.template.html',
    controller: function($scope, $http, tripService, API, $interval) {
      var self = this;
      var MAX_ZOOM = 17;
      var liveUpdatePromise;

      self.showTrip = function() {
        if(liveUpdatePromise) {
          $interval.cancel(liveUpdatePromise);
          liveUpdatePromise = null;
        }
        if(!self.curtrip.gps) {
          tripService.getTripGPS(self.curtrip, 0).then(function(trip) {
            displayTrip(self.curtrip)
            scheduleLive()
          }, function(res){
            alert("GPS load failed");
          });
        } else {
          displayTrip(self.curtrip); 
          scheduleLive();
        }
      };

      function scheduleLive() {
        if(self.curtrip.status == 1) {
          liveUpdatePromise = $interval(self.liveUpdate, 2000, 1);
        }
      }

      self.liveUpdate = function() {
        console.log("Live update for trip "+self.curtrip.guid);
        tripService.getTripGPS(self.curtrip, self.curtrip.data_endtime + 1).then(function(newGPS) {
          displayNewGPS(newGPS)
          scheduleLive();
        }, function(res){
          console.log("Live GPS load failed");
          scheduleLive();
        });
      }

      self.search = function(date) {
        var start = moment(date).startOf('month').valueOf();
        var end = moment(date).endOf('month').valueOf();
        console.log("search from:" + start + " to:" + end);
        $http({
          url: API + '/searchtrips',
          method: "POST",
          data: {'start':start, 'end':end }
        }).then(function(res) {
          if(res.data.status == "success") {
            tripService.setData(res.data.data);
            self.trips = tripService.getTrips();         
            self.setClickedRow(0); 
            self.onTimeSet(date);
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


      self.onTimeSet = function(date) {
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
        self.curtrip = tripService.getTrip(index);
        self.showTrip();
      }
      self.removeTrip = function(index) {
        var deletetrip = confirm('Are you sure you want to delete (unrecoverable)?');
        if (!deletetrip) {
          return; 
        }  
        $http({
            url: API + '/updateTrip',
            method: "POST",
            data: { 'guid' : tripService.getTrip(index).guid,
                    'status' : 0 }
        }).then(function(res) {
          if(res.data.status == 0) {
            //delete locally
            tripService.deleteTrip(index);    
            var len = Object.keys(tripService.getTrips()).length;
            self.curtrip = tripService.getTrip(index%len);  
            self.showTrip();
            self.setClickedRow(index%len);
          } else {
            alert("Delete failed on the server, try again later!");
          } 
        });  
      } 
      function initMap() {
        var madison = {lat: 43.073052, lng: -89.401230};
        self.map = new google.maps.Map(document.getElementById('map'), { zoom: 15, center: madison});
        self.mapOverlays = [];
      }

      function displayTrip(trip) {
        if(!trip) return null;
        var method = self.radioValue;

        self.slider.options.floor=trip.data_starttime,
        self.slider.options.ceil=trip.data_endtime,

        showLegend(method);

        var filteredtrip = trip.gps.filter(function(point, index) {return (point.time >= trip.starttime && point.time <= trip.endtime)});

        initChart(method);
        drawChart(filteredtrip, method);

        var latlngbounds = new google.maps.LatLngBounds();
        console.log("clear markers");
        //clear all circles and markers from the map
        while(self.mapOverlays[0])
        {
          var tmp = self.mapOverlays.pop();
          tmp.setMap(null);
        }

        drawMapGPS(filteredtrip, latlngbounds, method, (trip.status == 1));
        
        self.map.fitBounds(latlngbounds);
        if(self.map.getZoom() > MAX_ZOOM) {
          self.map.setZoom(MAX_ZOOM);
        }
      }

      function displayNewGPS(newPoints) {
        var method = self.radioValue;
        console.log(newPoints);
        if(newPoints.length >0){
          drawChart(newPoints,method, true);
          var latlngbounds = new google.maps.LatLngBounds();
          drawMapGPS(newPoints, latlngbounds, method, true);
        
          self.map.fitBounds(latlngbounds);
          if(self.map.getZoom() > MAX_ZOOM) {
            self.map.setZoom(MAX_ZOOM);
          }
        }
      }

      function drawMapGPS(gpsPoints, latlngbounds, method, live) {
        var colors = ['green', 'lightgreen', 'yellow', 'orange', 'red'];
        var icons = colors.map(function(color) {
          return {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 3,
              fillColor: color,
              fillOpacity: 1,
              strokeOpacity:0,
            }
        });

        var len = gpsPoints.length;
        var rate = parseInt(len/600) + 1;
        for(var i = 0; i < len; i += rate) {
          var point = gpsPoints[i];
          var latlng = new google.maps.LatLng(point.lat, point.lng);
          latlngbounds.extend(latlng);
          
          var index = 0;
          var speed = point.speed * 2.23694;
          var score = point.score;
          var brake = point.brake;
          var tilt = point.tilt;
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
          if(!live) {
            if(self.mapOverlays.carIcon) {
              self.mapOverlays.carIcon.setMap(null);
              self.mapOverlays.carIcon = null;
            }
            if (i==0) {
              var marker_icon = 'img/starticon.png' 
              self.mapOverlays.push(new google.maps.Marker({
                position: latlng,
                map: self.map,
                icon: 'img/starticon.png'
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
          } else {
            if(self.mapOverlays.carIcon) {
              self.mapOverlays.carIcon.setPosition(latlng);
            } else {
              self.mapOverlays.carIcon = new google.maps.Marker({
                position: latlng,
                map: self.map,
                icon: 'img/caricon.png'
              });
            }
          }
          self.mapOverlays.push(new google.maps.Marker({
            map: self.map,
            position: latlng,
            clickable: false,
            icon: icons[index],
          }));        
        }
      }
      function initChart(method) {
        var chart_type;
        var y_axis_text;
        var title_text;
        if(method == "speed") {
          title_text = "Speed";
          y_axis_text = "Speed (mph)";
          chart_type = "line";
        } else if(method=="score") {
          title_text = "Score";
          y_axis_text = "Score";
          chart_type = "line";
        } else if(method=="brake") {
          title_text = "Brakes";
          y_axis_text = "Braking";
          chart_type = "scatter";
        } else if(method=="tilt") {
          title_text = "Tilt";
          y_axis_text = "Tilt (Degree)";
          chart_type = "line";
        } else {
          console.log("unknown method:" + method);
        }
        self.chart = Highcharts.chart('chart', {
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
          plotOptions: {
            series: {
                animation: false
            }
          },
          series: [{
            data: [],
          }]
        });
      }
      function drawChart(data, method, appendLiveData) {
        var len = data.length;
        if(len>0){
          var data_list = [];
          var init_time = parseFloat(self.curtrip.starttime);
          var rate = parseInt(len/600) + 1;
          for(var i = 0; i < len; i+=1){
            var point = data[i];
            var current_time = parseFloat(point.time);
            var time = (current_time - init_time)/60000.0;
            if(method == "speed") {
              data_list.push([time, point.speed * 2.23694]);
            } else if(method=="score") {
              data_list.push([time, point.score]);
            } else if(method=="brake") {
              data_list.push([time, point.brake * -1]);
            } else if(method=="tilt") {
              data_list.push([time, point.tilt]);
            } else {
              console.log("unknown method:" + method);
            }
          } 
          if(!appendLiveData) {
            self.chart.series[0].setData(data_list);
          } else {
            self.chart.xAxis[0].update({
              min: data_list[data_list.length-1][0]-5,
            }, false);
            for (var i = 0; i < data_list.length; i++) {
              self.chart.series[0].addPoint(data_list[i], false);
            }
            self.chart.redraw();
          }
        }
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