function initMap() {
  var madison = {lat: 43.073052, lng: -89.401230};
  var map = new google.maps.Map(document.getElementById('map'), { zoom: 15, center: madison});

  var cururl = window.location.href;
  console.log(cururl);
  var geturl = cururl.replace("show.html", "show");
  $.get(geturl, function(msg, status){
     if(status=="success") { 
       if(msg.status == "err") {
	 console.log(JSON.stringify(msg.data));
	 alert("tripid is not valid!!!");
       } else {
	 //displayTrip(map, msg.data);
       }
     } else {
       console.log(status);
     }
  });
}
function displayTrip(map, data) {
  if(!data) return;
  var latlngbounds = new google.maps.LatLngBounds();
  for(var i = 0; i < data.length; ++i) {
    var point = data[i];
    var latlng = new google.maps.LatLng(point.x0, point.x1);
    latlngbounds.extend(latlng);
    var marker = new google.maps.Marker({
      position: latlng,
      map: map
    });
  }
  map.fitBounds(latlngbounds);
}

