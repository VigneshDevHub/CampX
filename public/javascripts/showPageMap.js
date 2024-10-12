mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/satellite-streets-v12', // style URL
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 10, // starting zoom
});

// map.addControl(new mapboxgl.NavigationControl());

// new mapboxgl.Marker()
//     .setLngLat(campground.geometry.coordinates)
//     .setPopup(
//         new mapboxgl.Popup({offset:25})
//         .setHTML(
//             `<h3>${campground.title}</h3><p>${campground.location}</p>`
//             )
//     )
//     .addTo(map)




// Create a popup, but don't add it to the map yet
const popup = new mapboxgl.Popup({ offset: 25, closeButton: false, closeOnClick: false}).setMaxWidth("300px").setHTML(
  
    `<h6>${campground.title}</h6><p>${campground.location}</p><span>Exact location provided after booking!</span>`
  );
  
  
  
  
  // Create a marker and add it to the map
  const marker = new mapboxgl.Marker({ color: "red" })
    .setLngLat(campground.geometry.coordinates)
    .addTo(map);
  
  
  
  
  // Add event listeners to the marker to show and hide the popup
  marker.getElement().addEventListener("mouseenter", () => {
    map.getCanvas().style.cursor = "pointer";
    marker.setPopup(popup).togglePopup(); // Show the popup on hover
  });
  
  
  
  marker.getElement().addEventListener("mouseleave", () => {
    map.getCanvas().style.cursor = "";
    marker.togglePopup(); // Hide the popup when not hovering
  });