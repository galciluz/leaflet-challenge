var link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(link).then(function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  console.log (data);
  createFeatures(data.features);
});

function chooseColor(depth) {
  if (depth <= 10){
    color= "#66ff66";
  } else if (depth>10 && depth<=30){
    color= "#ffff66";
  } else if (depth>30 && depth<=50){
    color= "#ffcc00";
  } else if (depth>50 && depth<=70){
    color= "#ffb366";
  } else if (depth>70 && depth<=90){
    color= "#ff9933";
  } else {
    color= "#ff6600";
  }
 return color;
}

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>Magnitude:" + feature.properties.mag + "</p>" +
      "</h3><p>Depth:" + feature.geometry.coordinates[2] + "</p>" +
      "</h3><p>" + new Date(feature.properties.time) + "</p>");
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature,latlng){
      
     var geojsonMarkerOptions = {
        radius: feature.properties.mag*4,
        fillColor: chooseColor(feature.geometry.coordinates[2]),
        color: "black",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
     };
     return L.circleMarker(latlng, geojsonMarkerOptions);
    }
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {
  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

   // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };
  
  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Legends
  var legend = L.control({position: 'bottomright'});
  legend.onAdd = function() {
      var div = L.DomUtil.create('div', 'info legend');
      var grades = [-10,10,30,50,70,90,90];
      var labels = [];
      var from;
      var to;

      for (var i = 0; i < grades.length; i++) {
        from = grades[i];
        to = grades[i + 1];
        div.innerHTML +=
              '<i style="background:' + chooseColor(from + 1) + '"></i> ' +
              from + (to ? '&ndash;' + to : '+') + '<p>';
      }
      div.innerHTML += "<ul>" + labels.join("") + "</ul>";
      return div;
  };
  legend.addTo(myMap);
}