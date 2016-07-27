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

var distance = function(lat1, lon1, lat2, lon2) {
  var p = 0.017453292519943295;    // Math.PI / 180
  var c = Math.cos;
  var a = 0.5 - c((lat2 - lat1) * p)/2 + 
          c(lat1 * p) * c(lat2 * p) * 
          (1 - c((lon2 - lon1) * p))/2;

  return 12742 * Math.asin(Math.sqrt(a)) * 0.621371; // 2 * R; R = 6371 km; to miles
}


function displayTrip(data, method) {
  if(!data) return null;
 
  drawChart(data,method);
  var madison = {lat: 43.073052, lng: -89.401230};
  var map = new google.maps.Map(document.getElementById('map'), { streetViewControl:false, navigationControl:false, scaleControl: false, mapTypeControl:false, zoomControl:false, zoom: 15, center: madison});
  var latlngbounds = new google.maps.LatLngBounds();
  var icons = getIcons();
  var len = data.length;
  var summary = {distance: 0, score: data[len-1].x3, duration: (data[len - 1].time - data[0].time)}; 
   
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

  for(var i = 0; i < len; ++i) {
    var point = data[i];
    var latlng = new google.maps.LatLng(point.x0, point.x1);
    latlngbounds.extend(latlng);
    
    if(i > 0) {
      summary.distance += distance(data[i - 1].x0, data[i - 1].x1, point.x0, point.x1);
    }

    var index = 0;

    var speed = point.x2;
    var score = point.x3;
    var brake = point.x4;
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
    var circle = icons[index].icon; 
    var marker = new google.maps.Marker({
      position: latlng,
      map: map,
      icon: circle
    });
  }
  map.fitBounds(latlngbounds);
  return summary;
}
function drawChart(data, method) {
  var len = data.length;
  var data_list = [];
  for(var i = 0; i < len; ++i){
    var point = data[i];
    var init_time = parseFloat(data[0].time);
    var current_time = parseFloat(point.time);
    var time = (current_time - init_time)/60000.0;
    var chart_type;
    var y_axis_text;
    var title_text;
    if(method == "speed") {
      data_list.push([time, point.x2]);
      title_text = "Speed";
      y_axis_text = "Speed (mph)";
      chart_type = "line";
    } else if(method=="score") {
      title_text = "Score";
      y_axis_text = "Score";
      chart_type = "line";
      data_list.push([time, point.x3]);
    } else if(method=="brake") {
      title_text = "Brakes";
      y_axis_text = "Braking";
      chart_type = "scatter";
      data_list.push([time, point.x4 * -1]);
    } else {
      console.log("unknown method:" + method);
    }
  } 
  $('#chart').highcharts({
        turboThreshold:10000,
        chart: {
            type: chart_type
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


