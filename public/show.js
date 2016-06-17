function initMap() {
  var madison = {lat: 43.073052, lng: -89.401230};
  var map = new google.maps.Map(document.getElementById('map'), { zoom: 15, center: madison});
}
function displayTrip(data) {
  if(!data) return;
  var map = new google.maps.Map(document.getElementById('map'), { zoom: 15, center: madison});
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

function displaySummary(arr) {
 console.log(arr);    
}


function showTrips() {
  var geturl = window.location.origin + "/mytrips";
  $.get(geturl, function(msg, status){
     if(status=="success") { 
       if(msg.status != "success") {	
	 alert("Load trips failed");
       } else {
	  displaySummary(msg.data); 
       }
     } else {
       alert(status);
     }
  });
}

