function initMap() {
  var madison = {lat: 43.073052, lng: -89.401230};
  var map = new google.maps.Map(document.getElementById('map'), { zoom: 15, center: madison});
}

var getIcons = function() {
  var res = [];
  var colors = ['red', 'orange', 'yellow', 'lightgreen', 'green'];
  for(var i = 0; i < colors.length; ++i) {
    var color = colors[i];
    var circle ={
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: color,
      fillOpacity: 0.8, //0.1 --1.0
      scale: 2.5,
      strokeColor: 'white',
      strokeWeight: 0 
    };
    res[i] = {color: color, icon: circle};
  }
  return res;
}
 


function displayTrip(trip, method) {
  if(!trip) return null;

  showLegend(method);
  drawChart(trip,method);

  var madison = {lat: 43.073052, lng: -89.401230};
  var map = new google.maps.Map(document.getElementById('map'), { streetViewControl:true, navigationControl:false, scaleControl: false, mapTypeControl:true, zoomControl:true, zoom: 15, center: madison});
  var latlngbounds = new google.maps.LatLngBounds();
  var icons = getIcons();
  var len = trip.gps.length;
  var summary = {distance: trip.distance, score: trip.score, duration: (trip.endtime - trip.starttime)}; 

 
  for(var i = 0; i < len; ++i) {
    var point = trip.gps[i];
    var latlng = new google.maps.LatLng(point.lat, point.lng);
    latlngbounds.extend(latlng);
    
    var index = 0;

    var speed = point.speed;
    var score = point.score;
    var brake = point.brake;
    if(method == "speed") {
      index = Math.round(speed/5.0);
    } else if(method=="score") {
      index = Math.round(score/2.0);
    } else if(method=="brake") {
      if(brake < 0) index = 3;
      else index = 0;
    } else {
      console.log("unknown method:" + method);
    }
    if(index >= icons.length) {
      index = icons.length - 1; 
    }
    if(isNaN(index)) {
      index = 0; 
      console.log("index calculation error");
    }
    var marker_icon = icons[index].icon;
    if (i==0){
      var marker_icon = 'img/starticon.png' 
    }
    else if  (i==len-1){
      var marker_icon = 'img/stopicon.png'
    }
    var marker = new google.maps.Marker({
      position: latlng,
      map: map,
      icon: marker_icon
    });
  }
  map.fitBounds(latlngbounds);
  return summary;
}



function drawChart(data, method) {
  var len = data.gps.length;
  var data_list = [];
  var init_time = parseFloat(data.starttime);
  for(var i = 0; i < len; ++i){
    var point = data.gps[i];
    var current_time = parseFloat(point.time);
    var time = (current_time - init_time)/60000.0;
    var chart_type;
    var y_axis_text;
    var title_text;
    if(method == "speed") {
      data_list.push([time, point.speed]);
      title_text = "Speed";
      y_axis_text = "Speed (mph)";
      chart_type = "line";
    } else if(method=="score") {
      title_text = "Score";
      y_axis_text = "Score";
      chart_type = "line";
      data_list.push([time, point.score]);
    } else if(method=="brake") {
      title_text = "Brakes";
      y_axis_text = "Braking";
      chart_type = "scatter";
      data_list.push([time, point.brake * -1]);
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
    $("#legend-high").html(">15mph");
    $("#legend-medhigh").html("10-15mph");
    $("#legend-med").html("5-10mph");
    $("#legend-medlow").html("0-5mph");
    $("#legend-low").html("0mph");
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
  } else {
    console.log("unknown method:" + method);
  }
}
