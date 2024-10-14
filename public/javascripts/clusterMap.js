mapboxgl.accessToken = mapToken; // Mapbox access token from the server

// Convert campgrounds data to GeoJSON format
const geoJsonCampgrounds = {
    type: 'FeatureCollection',
    features: campgrounds.map(campground => ({
        type: 'Feature',
        geometry: campground.geometry,  // Coordinates
        properties: {
            _id: campground._id,
            title: campground.title,
            location: campground.location,
            description: campground.description,
        }
    }))
};

// Initialize the Mapbox map
const map = new mapboxgl.Map({
    container: 'cluster-map',
    style: 'mapbox://styles/mapbox/satellite-streets-v12',
    center: [78.9629, 20.5937],
    zoom: 3
});

map.addControl(new mapboxgl.NavigationControl());

map.on('load', () => {
    // Add source for campgrounds data
    map.addSource('campgrounds', {
        type: 'geojson',
        data: geoJsonCampgrounds, // Use campgrounds data passed from the server
        cluster: true,
        clusterMaxZoom: 14, 
        clusterRadius: 50 
    });

// Add cluster layer
map.addLayer({
    id: 'clusters',
    type: 'circle',
    source: 'campgrounds',
    filter: ['has', 'point_count'],
    paint: {
        'circle-color': [
            'step',
            ['get', 'point_count'],
            'rgba(255, 56, 93, 0.5)', 
            10,
            'rgba(255, 56, 93, 0.27)',
            30,
            'rgba(255, 56, 93, 0.27)' 
        ],
        'circle-radius': [
            'step',
            ['get', 'point_count'],
            30,
            10,
            35,
            30,
            45
        ]
    }
});



    // Add cluster count layer
    map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'campgrounds',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': ['get', 'point_count_abbreviated'],
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
        },
        paint: {
            'text-color': '#ffffff' // Change this to your desired color
        }
    });

    // Add unclustered point layer
    map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'campgrounds',
        filter: ['!', ['has', 'point_count']],
        paint: {
            'circle-color': 'red',
            'circle-radius': 8,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
        }
    });


    let activePopup = null;

    // Cluster hover effect to display the number of listings
    map.on('mouseenter', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        const clusterProperties = features[0].properties;
        const clusterCoordinates = features[0].geometry.coordinates.slice();

        if(activePopup){
            activePopup.remove();
            activePopup = null;
        }
        else{ // Display the number of listings in the cluster
            map.getCanvas().style.cursor = "pointer";
            activePopup = new mapboxgl.Popup({ offset: 5, closeButton: false, closeOnClick: false})
                .setLngLat(clusterCoordinates)
                .setHTML(`<p>Number of campgrounds in this area: </p> <span>${clusterProperties.point_count}</span>`)
                .addTo(map);
        }
        
        
    });

    map.on('mouseleave', 'clusters', () => {
        if (activePopup) {
            activePopup.remove(); // Close the popup on mouse leave
            activePopup = null; // Reset active popup reference
        }
        map.getCanvas().style.cursor = '';
    });

    // Hover effect to show popup with campground details
    map.on('mouseenter', 'unclustered-point', (e) => {
        console.log(e);
        const coordinates = e.features[0].geometry.coordinates.slice();
        const properties = e.features[0].properties;
        console.log(properties);


        const title = properties.title || 'No title available.';
        const location = properties.location || 'No location available.';

        const locationDetails = `<span>${title}</span><br/><b>${location}</b><p>Exact location provided after booking.</p>`;

        if(activePopup){
            activePopup.remove();
            activePopup = null;
        }
        else{
            map.getCanvas().style.cursor = "pointer";
            activePopup = new mapboxgl.Popup({ offset: 5, closeButton: false, closeOnClick: false})
            .setLngLat(coordinates)
            .setHTML(locationDetails)
            .addTo(map);
        }
        
    });

    // Remove the popup on mouseleave
    map.on('mouseleave', 'unclustered-point', () => {
        if (activePopup) {
            activePopup.remove(); 
            activePopup = null; 
        }
        map.getCanvas().style.cursor = '';
    });

    // Expand cluster on click
    map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, {
            layers: ['clusters']
        });
        map.getCanvas().style.cursor = "pointer";
        const clusterId = features[0].properties.cluster_id;
        map.getSource('campgrounds').getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err) return;
            map.easeTo({
                center: features[0].geometry.coordinates,
                zoom: zoom
            });
        });
    });

});
