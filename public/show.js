function initMap() {
  var madison = {lat: 43.073052, lng: -89.401230};
  var map = new google.maps.Map(document.getElementById('map'), { zoom: 15, center: madison});
}

var getIcons = function() {
  var res = [];
  var colors = ['green', 'blue', 'yellow', 'red'];
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

function displayTrip(data) {
  if(!data) return;
  var madison = {lat: 43.073052, lng: -89.401230};
  var map = new google.maps.Map(document.getElementById('map'), { zoom: 15, center: madison});
  var latlngbounds = new google.maps.LatLngBounds();
  var icons = getIcons();
  for(var i = 0; i < data.length; ++i) {
    var point = data[i];
    var latlng = new google.maps.LatLng(point.x0, point.x1);
    latlngbounds.extend(latlng);

    var speed = point.x2;
    var index = Math.round(speed/5.0);
    if(index >= icons.length) {
      index = icons.length - 1; 
    }
    var circle = icons[index].icon; 
    var marker = new google.maps.Marker({
      position: latlng,
      map: map,
      icon: circle
    });
  }
  map.fitBounds(latlngbounds);
}


