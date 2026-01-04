'use client';
import React, { useCallback, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = {
    width: '100%',
    height: '100%'
};

const defaultCenter = {
    lat: 40.7128,
    lng: -74.0060
};

const MapComponent = ({ center = defaultCenter, zoom = 15, markers = [], className = "" }) => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY
    });

    const [map, setMap] = useState(null);

    const onLoad = useCallback(function callback(map) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(map) {
        setMap(null);
    }, []);

    if (!isLoaded) return <div className={`bg-zinc-800 animate-pulse rounded-xl ${className}`} style={{ height: '300px' }}></div>;

    return (
        <div className={`rounded-xl overflow-hidden ${className}`} style={{ height: '300px' }}>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={zoom}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={{
                    styles: [
                        {
                            "elementType": "geometry",
                            "stylers": [{ "color": "#212121" }]
                        },
                        {
                            "elementType": "labels.icon",
                            "stylers": [{ "visibility": "off" }]
                        },
                        {
                            "elementType": "labels.text.fill",
                            "stylers": [{ "color": "#757575" }]
                        },
                        {
                            "elementType": "labels.text.stroke",
                            "stylers": [{ "color": "#212121" }]
                        },
                        {
                            "featureType": "administrative",
                            "elementType": "geometry",
                            "stylers": [{ "color": "#757575" }]
                        },
                        {
                            "featureType": "poi",
                            "elementType": "geometry",
                            "stylers": [{ "color": "#181818" }]
                        },
                        {
                            "featureType": "poi",
                            "elementType": "labels.text.fill",
                            "stylers": [{ "color": "#757575" }]
                        },
                        {
                            "featureType": "road",
                            "elementType": "geometry.fill",
                            "stylers": [{ "color": "#2c2c2c" }]
                        },
                        {
                            "featureType": "road",
                            "elementType": "labels.text.fill",
                            "stylers": [{ "color": "#8a8a8a" }]
                        },
                        {
                            "featureType": "water",
                            "elementType": "geometry",
                            "stylers": [{ "color": "#000000" }]
                        }
                    ],
                    disableDefaultUI: true,
                    zoomControl: true,
                }}
            >
                {markers.map((marker, index) => (
                    <Marker
                        key={index}
                        position={marker.position}
                        title={marker.title}
                    />
                ))}
            </GoogleMap>
        </div>
    );
};

export default React.memo(MapComponent);
