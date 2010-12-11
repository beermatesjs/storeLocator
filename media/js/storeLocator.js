var stores = [];
var settings = {};
var markers = [];
var infoWindows = [];
var activeInfoWindow;

function loadStores(root) {
  var feed = root.feed;
  stores = feed.entry || [];
}

function loadSettings(root) {
  var feed = root.feed;
  var entries = feed.entry || [];
  for (var i = 0; i < entries.length; ++i) {
    var entry = entries[i];
    settings[entry.title.$t] = entry.gsx$value.$t
  }
}

function initialize() {
	var center = new google.maps.LatLng(parseFloat(settings["Starting Center Latitude"]), parseFloat(settings["Starting Center Longitude"]));
    var mapOptions = {
        zoom: parseInt(settings["Starting Zoom"]),
        center: center,
        mapTypeId: eval("google.maps.MapTypeId." + settings["Map Type"])
    };

    var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

	// Load markers
	for (var i = 0; i < stores.length; ++i) {
        var store = stores[i];
        writeAccordion(store);
    
        var name = store.gsx$storename.$t;
        var address = store.gsx$address.$t;
        var lat = parseFloat(store.gsx$latitude.$t);
        var lng = parseFloat(store.gsx$longitude.$t);

        var latlng = new google.maps.LatLng(lat, lng);
        var marker = new google.maps.Marker({
          position: latlng,
          map: map,
          title: name
        });
        var content_str = '<p><strong>' + name + '</strong><br />' + address + '</p>';
        var infoWindow = new google.maps.InfoWindow({
              content: content_str,
              title: name,
              marker: marker
        });
        (function(marker, infoWindow, i) {
            google.maps.event.addListener(marker, 'click', function() {
                if (activeInfoWindow != undefined) {
                    activeInfoWindow.close()
                }
                infoWindow.open(marker.map, marker);
                activeInfoWindow = infoWindow;
                $('#accordion').accordion("activate", i);
            });
        })(marker, infoWindow, i)
        markers.push(marker);
        infoWindows.push(infoWindow);
  }
  var markerCluster = new MarkerClusterer(map, markers, {maxZoom: parseInt(settings["Marker Cluster Zoom"])});
}

// writes store information
function writeAccordion(store) {
    var name = store.gsx$storename.$t;
    var description = store.gsx$description.$t;
    $('#accordion').append('<h3><a href="#">' + name + '</a></h3><div><p>' + description);
}

$(document).ready(function() {
    initialize();
    $(function() {
        $("#store-list").draggable();
        $("#accordion").accordion({ 
            header: "h3",
            change: function(events, ui) {
                var newheader = ui.newHeader.text();
                if (activeInfoWindow != undefined) {
                    activeInfoWindow.close()
                }
                $.each(infoWindows, function(idx) {
                    if (infoWindows[idx].title === newheader) {
                        infoWindows[idx].open(infoWindows[idx].marker.map, infoWindows[idx].marker);
                        activeInfoWindow = infoWindows[idx];
                    }
                });
            },
        });
    });
});