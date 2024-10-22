// Set the Mapbox access token from the server
mapboxgl.accessToken = mapToken; 

/**
 * Convert campgrounds data to GeoJSON format.
 * Each campground is transformed into a GeoJSON Feature with properties and geometry.
 */
const geoJsonCampgrounds = {
    type: 'FeatureCollection',
    features: campgrounds.map(campground => ({
        type: 'Feature',
        geometry: campground.geometry,  // Geographical coordinates (longitude, latitude)
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
    container: 'cluster-map', // HTML container ID for the map
    style: 'mapbox://styles/mapbox/satellite-streets-v12', // Map style
    center: [78.9629, 20.5937], // Initial center of the map (India coordinates)
    zoom: 3 // Initial zoom level
});

// Add zoom and rotation controls to the map
map.addControl(new mapboxgl.NavigationControl());

map.on('load', () => {
    /**
     * Add a GeoJSON data source to the map for campgrounds.
     * Cluster properties are enabled to group points visually based on proximity.
     */
    map.addSource('campgrounds', {
        type: 'geojson',
        data: geoJsonCampgrounds, // Campgrounds data in GeoJSON format
        cluster: true, // Enable clustering
        clusterMaxZoom: 14, // Max zoom level for clustering
        clusterRadius: 50 // Radius (in pixels) for clustering
    });

    // Layer for clustered campgrounds
    map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'campgrounds',
        filter: ['has', 'point_count'], // Filter only clusters
        paint: {
            'circle-color': [
                'step', ['get', 'point_count'],
                'rgba(255, 56, 93, 0.5)', 10, // Red for small clusters
                'rgba(255, 56, 93, 0.27)', 30, // Lighter red for medium clusters
                'rgba(255, 56, 93, 0.27)' // Same color for larger clusters
            ],
            'circle-radius': [
                'step', ['get', 'point_count'],
                30, 10, // Radius increases with more points
                35, 30,
                45
            ]
        }
    });

    // Layer for displaying the count of campgrounds in each cluster
    map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'campgrounds',
        filter: ['has', 'point_count'], // Apply only to clusters
        layout: {
            'text-field': ['get', 'point_count_abbreviated'], // Display abbreviated point count
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12 // Font size
        },
        paint: {
            'text-color': '#ffffff' // White text color
        }
    });

    // Layer for individual, unclustered campgrounds
    map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'campgrounds',
        filter: ['!', ['has', 'point_count']], // Apply only to non-clustered points
        paint: {
            'circle-color': 'red', // Red color for individual points
            'circle-radius': 8, // Size of the point
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff' // White stroke around the point
        }
    });

    let activePopup = null; // Track the currently open popup

    // Show cluster popup on hover
    map.on('mouseenter', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        const { point_count } = features[0].properties;
        const coordinates = features[0].geometry.coordinates.slice(); // Clone to avoid mutation

        closePopup(); // Close any open popup

        map.getCanvas().style.cursor = 'pointer'; // Change cursor to pointer
        activePopup = new mapboxgl.Popup({ offset: 5, closeButton: false, closeOnClick: false })
            .setLngLat(coordinates)
            .setHTML(`<p>Number of campgrounds in this area:</p><span>${point_count}</span>`)
            .addTo(map);
    });

    // Reset cursor and close popup when leaving cluster
    map.on('mouseleave', 'clusters', () => {
        closePopup();
        map.getCanvas().style.cursor = '';
    });

    // Show campground details popup on hover
    map.on('mouseenter', 'unclustered-point', (e) => {
        const { geometry, properties } = e.features[0];
        const coordinates = geometry.coordinates.slice();
        const title = properties.title || 'No title available.';
        const location = properties.location || 'No location available.';

        closePopup(); // Close any open popup

        map.getCanvas().style.cursor = 'pointer';
        activePopup = new mapboxgl.Popup({ offset: 5, closeButton: false, closeOnClick: false })
            .setLngLat(coordinates)
            .setHTML(`<span>${title}</span><br/><b>${location}</b>`)
            .addTo(map);
    });

    // Close popup and reset cursor when leaving unclustered point
    map.on('mouseleave', 'unclustered-point', () => {
        closePopup();
        map.getCanvas().style.cursor = '';
    });

    // Expand cluster on click to show more details
    map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        const clusterId = features[0].properties.cluster_id;
        const coordinates = features[0].geometry.coordinates;

        map.getSource('campgrounds').getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err) return;
            map.easeTo({ center: coordinates, zoom });
        });
    });

    /**
     * Helper function to close the active popup if it exists.
     */
    function closePopup() {
        if (activePopup) {
            activePopup.remove();
            activePopup = null;
        }
    }
});
