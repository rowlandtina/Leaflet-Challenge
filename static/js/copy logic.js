// Store our API as queryUrl for date specific
const queryUrl =
"https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// console.log(queryUrl);

//all the earthquake api
d3.json(queryUrl).then(createEarthquakeMap);

function createEarthquakeMap(data) {
  let earthquakeLayer = createEarthquakeLayer(data.features);
  createMap(earthquakeLayer);
}

function createEarthquakeLayer(earthquakeData) {
   // set up layer properties - for the property call the function listed
  // create style function for onStyle 
  
  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: pointToLayer,
    style: onStyle,
    
  });

  // function sets up markers for each point - used the onStyle function 
  function pointToLayer(point, latlng) {
    // console.log("point to layer");
      return L.circleMarker(latlng);
      }

  // add the information pop-up to the data point
  // 'new Date' allows us to create a JS date object from the text date
  function onEachFeature(feature, layer) {
    // console.log("on each feature...");
    // console.log(feature.properties.place === layer.feature.properties.place);
    // console.log(layer.feature.properties.place);
    layer.bindPopup(
      `<h4> ${feature.properties.place} - mag: ${feature.properties.mag} </h4> <hr>
      ${new Date(feature.properties.time)}`
    );
  }

  return earthquakes;
}

function createMap(earthquakes) {
  // Define streetmap, satellite, light and darkmap layers
  let streetmap = L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
    {
      attribution:
        "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: "mapbox/streets-v11",
      accessToken: API_KEY,
    }
  );
  let satellite = L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
    {
      attribution:
        "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: "mapbox/satellite-streets-v11",
      accessToken: API_KEY,
    }
  );
  let darkmap = L.tileLayer(
    "https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: "dark-v10",
      accessToken: API_KEY,
    }
  );
  let lightmap = L.tileLayer(
    "https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: "light-v10",
      accessToken: API_KEY,
    }
  );
  // Define a baseMaps object to hold our base layers
  let baseMaps = {
    "Street Map": streetmap,
    "Satellite Map": satellite,
    "Dark Map": darkmap,
    "Light Map": lightmap,
  };
  
  // Create overlay object to hold our overlay layer
  // need to add tectonic plates -- data can be found at https://github.com/fraxen/tectonicplates
  let overlayMaps = {
    Earthquakes: earthquakes,
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  let myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [satellite, earthquakes],
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control
    .layers(baseMaps, overlayMaps, {
      collapsed: false,
    }).addTo(myMap);


  // Add legend to map using leaflet documentation
    let legend = L.control({position: 'bottomleft'});

    legend.onAdd = function (map) {
    
        let div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 1, 2, 3, 4, 5, 6],
            labels = [];
    
        // From leaflet add legend
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
    
        return div;
    }
    
    legend.addTo(myMap);
}

// Set the color palatte for the circle markers per Leaflet documentation
function getColor(d){
  return  d > 6 ? '#cc0099' :
          d > 5 ? '#ff0000' :
          d > 4 ? '#ff6000' :
          d > 3 ? '#ff8000' :
          d > 2 ? '#ffbf00' :
          d > 1 ? '#ffff00' :
                  '#ccff33' 
}
// create a function to set the marker radius and colors based on magnitude of the earthquake
function onStyle(feature) {
  let mag = feature.properties.mag; 
  let selColor = getColor(mag)

  return {radius: feature.properties.mag*2.  ,
    color: "#000",
    fillColor: selColor,
    fillOpacity: 0.9,
    weight: 1,
    opacity: 0.2}
}


// Create layer for fault line geoJson
  let link = 'PB2002_plates.geojson';

// Our style object
let faultStyle = {
  color: "red",
  fillColor: "green",
  fillOpacity: 0,
  weight: 2.5
};

// Grab our GeoJSON data..
d3.json(link, function(data) {

// Create geoJSON layer with the retrieved data
  L.geoJson(data, {
    // Pass in our style object

    style: faultStyle
  }).addTo(myMap);
});