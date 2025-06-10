import React, { useEffect, useRef, useState } from 'react'
import { View, Platform, PermissionsAndroid, Alert } from 'react-native';
import { PROVIDER_GOOGLE } from 'react-native-maps';
import MapView, { Marker, Region, UserLocationChangeEvent, Polyline } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import { Place } from '../../model/LocationModel';
import { Colors, Utils } from '../../constants';
import { CustomMarker } from '.';
import { DEFAULT_REGION } from '../../data/defaultData';
import { GOOGLE_API_KEY } from '../../data/storeKey';
import axios from 'axios';

interface MyMapProps {
    session?: any;
    setSession?: (key: string, value: any) => void;
}

const MyMap: React.FC<MyMapProps> = ({ session, setSession }) => {
    const mapRef = useRef<MapView>(null);
    const [initialRegion, setInitialRegion] = useState<Region>(DEFAULT_REGION);
    const [mapReady, setMapReady] = useState<boolean>(false);
    const [markerRefs, setMarkerRefs] = useState<{ [key: string]: any }>({});
    const [markerCoordinates, setMarkerCoordinates] = useState<any[]>([]);

    // Request location permission and get current location
    const requestLocationPermission = async () => {
        if (Platform.OS === 'ios') {
            const status = await Geolocation.requestAuthorization('whenInUse');
            return status === 'granted';
        } else {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: "Location Permission",
                        message: "App needs access to your location",
                        buttonNeutral: "Ask Me Later",
                        buttonNegative: "Cancel",
                        buttonPositive: "OK"
                    }
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn(err);
                return false;
            }
        }
    };

    // Get user's current location on component mount
    useEffect(() => {
        getCurrentLocation();
    }, []);
    const getCurrentLocation = async () => {
        const hasPermission = await requestLocationPermission();

        if (hasPermission) {

            Geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;

                    // Position user marker toward the top by shifting the center point south
                    const adjustedLatitude = latitude - 0.003; // Shift south to move marker up

                    const newRegion = {
                        latitude: adjustedLatitude, // Use adjusted latitude
                        longitude: longitude,
                        latitudeDelta: 0.015,
                        longitudeDelta: 0.0121,
                    };

                    setInitialRegion(newRegion);

                    if (setSession) {
                        setSession('user_location', {
                            latitude,
                            longitude,
                            timestamp: position.timestamp,
                        });
                    }
                },
                (error) => {
                    console.log(error.code, error.message);
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
            );
        }
    };

    // Track user location changes
    const handleUserLocationChange = (event: UserLocationChangeEvent) => {
        const { coordinate } = event.nativeEvent;

        // Add timestamp check to limit updates to once every 30 seconds
        const currentTime = new Date().getTime();
        const lastUpdateTime = session?.user_location?.timestamp || 0;

        // Only update if at least 30 seconds have passed since last update
        if (coordinate && setSession && (currentTime - lastUpdateTime >= 10000)) {
            setSession('user_location', {
                latitude: coordinate.latitude,
                longitude: coordinate.longitude,
                timestamp: currentTime,
            });
        }
    };

    // Calculate boundaries to fit all markers
    const calculateBoundaries = (locations: Place[]) => {
        if (!locations || locations.length === 0) return null;

        // Create a complete array of all points to include in the boundary calculation
        let allPoints: any[] = [];

        // 1. Add all route locations
        const validLocations = locations.filter(location =>
            location &&
            location.latitude &&
            location.longitude &&
            location.latitude !== 0 &&
            location.longitude !== 0
        );
        allPoints = [...validLocations];

        // 2. Add user location if available
        if (session?.user_location?.latitude && session?.user_location?.longitude) {
            allPoints.push({
                latitude: session.user_location.latitude,
                longitude: session.user_location.longitude
            });
        }

        // 3. Add start location from extraCircuitData if available
        if (session?.current_route_trip?.extraCricuitData?.startLocation?.latitude &&
            session?.current_route_trip?.extraCricuitData?.startLocation?.longitude) {
            allPoints.push({
                latitude: session.current_route_trip.extraCricuitData.startLocation.latitude,
                longitude: session.current_route_trip.extraCricuitData.startLocation.longitude
            });
        }

        // 4. Add end location from extraCircuitData if available and different from start
        if (session?.current_route_trip?.extraCricuitData?.endLocation) {
            // Case 2: Custom end location
            if (session.current_route_trip.extraCricuitData.endLocation.id === 2 &&
                session.current_route_trip.extraCricuitData.endLocation.latitude &&
                session.current_route_trip.extraCricuitData.endLocation.longitude) {
                allPoints.push({
                    latitude: session.current_route_trip.extraCricuitData.endLocation.latitude,
                    longitude: session.current_route_trip.extraCricuitData.endLocation.longitude
                });
            }
            // For Case 1 (return to start) - start location is already included
            // For Case 3 (last stop is end) - locations are already included
        }

        if (allPoints.length === 0) return null;

        // Find min/max lat/lng
        let minLat = Number.MAX_VALUE;
        let maxLat = Number.MIN_VALUE;
        let minLng = Number.MAX_VALUE;
        let maxLng = Number.MIN_VALUE;

        allPoints.forEach(point => {
            if (!point.latitude || !point.longitude) return;

            minLat = Math.min(minLat, point.latitude);
            maxLat = Math.max(maxLat, point.latitude);
            minLng = Math.min(minLng, point.longitude);
            maxLng = Math.max(maxLng, point.longitude);
        });

        // Calculate center point and deltas with padding
        const centerLat = (minLat + maxLat) / 2;
        const centerLng = (minLng + maxLng) / 2;

        // Add padding (70% more space) to ensure all markers are visible with enough margin
        const latDelta = (maxLat - minLat) * 1.7;
        const lngDelta = (maxLng - minLng) * 1.7;

        // Shift the center slightly upward to position markers toward the top
        // This moves the center point northward by 25% of the latitude span
        const adjustedCenterLat = centerLat + (latDelta * 0.25);

        return {
            latitude: adjustedCenterLat,  // Shifted center latitude
            longitude: centerLng,
            latitudeDelta: Math.max(latDelta, 0.02),
            longitudeDelta: Math.max(lngDelta, 0.02)
        };
    };

    // Update the map view based on locations
    const updateMapView = () => {
        if (!mapRef.current) return;

        // Get locations from session
        const locations = session?.current_route_trip?.locations || [];
        console.log('Updating map view with locations:', locations.length);

        // For optimized routes, calculate boundaries and animate to region
        if (session?.current_route_trip?.isOptimized) {
            const boundaries = calculateBoundaries(locations);
            if (boundaries) {
                console.log('Animating to calculated boundaries for optimized route:', boundaries);
                mapRef.current.animateToRegion(boundaries, 500);
                return;
            }
        } else {
            // Method 1: Try using fitToSuppliedMarkers for non-optimized routes
            try {
                // Create an array of valid marker IDs
                const markerIds = locations
                    .filter((loc: Place) => loc && loc.uniqueId && loc.latitude && loc.longitude)
                    .map((loc: Place) => loc.uniqueId);

                // Add start and end location markers if they exist
                if (session?.current_route_trip?.extraCricuitData?.startLocation?.latitude) {
                    markerIds.push("start_location");
                }
                if (session?.current_route_trip?.extraCricuitData?.endLocation?.id === 2) {
                    markerIds.push("end_location");
                }

                if (markerIds.length > 0) {
                    console.log('Fitting to markers:', markerIds);
                    setTimeout(() => {
                        // Use asymmetric padding to position markers toward the top
                        mapRef.current?.fitToSuppliedMarkers(markerIds, {
                            edgePadding: {
                                top: 100,     // Less padding at the top
                                right: 100,
                                bottom: 300,  // More padding at the bottom
                                left: 100
                            },
                            animated: true
                        });
                    }, 500);
                    return;
                }
            } catch (error) {
                console.log('Error fitting markers:', error);
                // Fall through to method 2
            }
        }

        // Method 3: If no locations, default to user location
        if (session?.user_location?.latitude && session?.user_location?.longitude) {
            console.log('Falling back to user location');
            // Position user location marker toward the top by shifting the center point south
            const adjustedLatitude = session.user_location.latitude - 0.003; // Shift south to move marker up

            mapRef.current.animateToRegion({
                latitude: adjustedLatitude, // Use adjusted latitude
                longitude: session.user_location.longitude,
                latitudeDelta: 0.015,
                longitudeDelta: 0.0121
            }, 500);
        }
    };

    // Handle when the map is ready
    const handleMapReady = () => {
        console.log('Map is ready');
        setMapReady(true);

        // Add a slight delay to make sure all markers are rendered
        setTimeout(updateMapView, 500);
    };

    // Update map when locations change or are added
    useEffect(() => {
        if (mapReady && session?.current_route_trip?.locations) {
            console.log('Locations changed, updating map...');

            // Create array of coordinates for polyline
            if (session?.current_route_trip?.isOptimized) {
                const coordinates = [];

                // Add start location if available in extraCricuitData
                if (session?.current_route_trip?.extraCricuitData?.startLocation?.latitude &&
                    session?.current_route_trip?.extraCricuitData?.startLocation?.longitude) {
                    coordinates.push({
                        latitude: session.current_route_trip.extraCricuitData.startLocation.latitude,
                        longitude: session.current_route_trip.extraCricuitData.startLocation.longitude
                    });
                } else if (session?.user_location?.latitude && session?.user_location?.longitude) {
                    // Fall back to user location
                    coordinates.push({
                        latitude: session.user_location.latitude,
                        longitude: session.user_location.longitude
                    });
                }

                // Add all route locations in order
                session.current_route_trip.locations.forEach((location: Place) => {
                    if (location?.latitude && location?.longitude &&
                        location.latitude !== 0 && location.longitude !== 0) {
                        coordinates.push({
                            latitude: location.latitude,
                            longitude: location.longitude
                        });
                    }
                });

                // Add end location if configured
                if (session?.current_route_trip?.extraCricuitData?.endLocation) {
                    // Case 1: Return to start (roundtrip)
                    if (session.current_route_trip.extraCricuitData.endLocation.id === 1 && coordinates[0]) {
                        coordinates.push(coordinates[0]);
                    }
                    // Case 2: Custom end location
                    else if (session.current_route_trip.extraCricuitData.endLocation.id === 2 &&
                        session.current_route_trip.extraCricuitData.endLocation.latitude &&
                        session.current_route_trip.extraCricuitData.endLocation.longitude) {
                        coordinates.push({
                            latitude: session.current_route_trip.extraCricuitData.endLocation.latitude,
                            longitude: session.current_route_trip.extraCricuitData.endLocation.longitude
                        });
                    }
                    // Case 3: No end location (last stop is end) - already handled by adding all locations
                }

                // Make sure all coordinates are valid
                const filteredCoordinates = coordinates.filter(coord =>
                    coord && coord.latitude && coord.longitude &&
                    typeof coord.latitude === 'number' &&
                    typeof coord.longitude === 'number');

                calculatePolyline(filteredCoordinates)
            }

            setTimeout(updateMapView, 500);
        }
    }, [
        session?.current_route_trip?.locations,
        session?.current_route_trip?.isOptimized,
        session?.current_route_trip?.extraCricuitData?.startLocation,
        session?.current_route_trip?.extraCricuitData?.endLocation,
        mapReady
    ]);

    // Focus on selected location
    useEffect(() => {
        if (mapRef.current && session?.selectedLocation) {
            const { latitude, longitude } = session.selectedLocation;

            if (latitude && longitude && latitude !== 0 && longitude !== 0) {
                // Position the selected location marker toward the top of the screen
                // by shifting the center point south
                const adjustedLatitude = latitude - 0.003; // Shift south slightly

                mapRef.current.animateToRegion({
                    latitude: adjustedLatitude, // Use adjusted latitude to shift marker up
                    longitude: longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01
                }, 500);
            }
        }
    }, [session?.selectedLocation]);

    const calculatePolyline = async (filteredCoordinates: any[]) => {
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${filteredCoordinates[0].latitude},${filteredCoordinates[0].longitude}&destination=${filteredCoordinates[filteredCoordinates.length - 1].latitude},${filteredCoordinates[filteredCoordinates.length - 1].longitude}&waypoints=${filteredCoordinates.slice(1, filteredCoordinates.length - 1).map(coord => `${coord.latitude},${coord.longitude}`).join('|')}&key=${GOOGLE_API_KEY}`;
        const response = await axios.get(url);
        console.log("Polyline response", response.data);
        const polyline = response?.data?.routes[0]?.overview_polyline?.points || '';
        setMarkerCoordinates(Utils.decodePolyline(polyline));
    };

    return (
        <View style={{ flex: 1 }}>
            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={{ flex: 1 }}
                initialRegion={initialRegion}
                showsUserLocation={true}
                showsMyLocationButton={true}
                followsUserLocation={false}
                onUserLocationChange={handleUserLocationChange}
                onMapReady={handleMapReady}
                loadingEnabled={false}
            >
                {/* Route location markers */}
                {session?.current_route_trip?.locations?.map((location: Place, index: number) => {

                    if (!location?.latitude || !location?.longitude ||
                        location.latitude === 0 || location.longitude === 0) {
                        return null;
                    }

                    const markerId = location.uniqueId || `loc_${index}`;

                    return (
                        <Marker
                            zIndex={99}
                            key={markerId}
                            identifier={markerId}
                            ref={(ref) => {
                                if (ref && !markerRefs[markerId]) {
                                    setMarkerRefs(prev => ({
                                        ...prev,
                                        [markerId]: ref
                                    }));
                                }
                            }}
                            coordinate={{
                                latitude: location.latitude,
                                longitude: location.longitude
                            }}
                            title={location.title || `Location ${index + 1}`}
                            description={location.subtitle || ''}
                        // anchor={{ x: 0.5, y: 1 }}
                        // calloutAnchor={{ x: 0.5, y: 0 }}
                        // style={{ height: "100%", width: "100%" }}
                        >
                            <CustomMarker
                                location={location}
                                locationIndex={index + 1}
                            />
                        </Marker>
                    );
                })}

                {/* Special marker for user location - makes fitting markers easier */}
                {session?.user_location?.latitude && session?.user_location?.longitude && (
                    <Marker
                        identifier="user_location"
                        coordinate={{
                            latitude: session.user_location.latitude,
                            longitude: session.user_location.longitude
                        }}
                        opacity={0}
                    />
                )}

                {/* Start location marker - only when route is optimized */}
                {session?.current_route_trip?.isOptimized && (
                    <>
                        {/* Start location marker */}
                        {session?.current_route_trip?.extraCricuitData?.startLocation?.latitude &&
                            session?.current_route_trip?.extraCricuitData?.startLocation?.longitude ? (
                            <Marker
                                identifier="start_location"
                                coordinate={{
                                    latitude: session.current_route_trip.extraCricuitData.startLocation.latitude,
                                    longitude: session.current_route_trip.extraCricuitData.startLocation.longitude
                                }}
                                title="Start Location"
                                description={session.current_route_trip.extraCricuitData.startLocation.title || "Starting point"}
                            >
                                <CustomMarker
                                    location={session.current_route_trip.extraCricuitData.startLocation}
                                    locationIndex={"·"}
                                    isStartLocation={true}
                                />
                            </Marker>
                        ) : session?.user_location?.latitude && session?.user_location?.longitude && (
                            <Marker
                                identifier="start_location"
                                coordinate={{
                                    latitude: session.user_location.latitude,
                                    longitude: session.user_location.longitude
                                }}
                                title="Start Location"
                                description="Current location (starting point)"
                            >
                                <CustomMarker
                                    location={session.user_location}
                                    locationIndex={"·"}
                                    isStartLocation={true}
                                />
                            </Marker>
                        )}

                        {/* End location marker */}
                        {session?.current_route_trip?.isOptimized && session?.current_route_trip?.extraCricuitData?.endLocation && (
                            <>
                                {/* Case 1: Return to start (roundtrip) */}
                                {session.current_route_trip.extraCricuitData.endLocation.id === 1 &&
                                    session?.current_route_trip?.extraCricuitData?.startLocation?.latitude &&
                                    session?.current_route_trip?.extraCricuitData?.startLocation?.longitude && (
                                        <Marker
                                            identifier="end_location"
                                            coordinate={{
                                                latitude: session.current_route_trip.extraCricuitData.startLocation.latitude,
                                                longitude: session.current_route_trip.extraCricuitData.startLocation.longitude
                                            }}
                                            title="End Location (Return to Start)"
                                            description="Same as starting point (roundtrip)"
                                        >
                                            <CustomMarker
                                                location={session.current_route_trip.extraCricuitData.startLocation}
                                                locationIndex={"·"}
                                                isEndLocation={true}
                                            />
                                        </Marker>
                                    )}

                                {/* Case 2: Custom end location */}
                                {session.current_route_trip.extraCricuitData.endLocation.id === 2 &&
                                    session.current_route_trip.extraCricuitData.endLocation.latitude &&
                                    session.current_route_trip.extraCricuitData.endLocation.longitude && (
                                        <Marker
                                            identifier="end_location"
                                            coordinate={{
                                                latitude: session.current_route_trip.extraCricuitData.endLocation.latitude,
                                                longitude: session.current_route_trip.extraCricuitData.endLocation.longitude
                                            }}
                                            title="End Location"
                                            description={session.current_route_trip.extraCricuitData.endLocation.title || "Final destination"}
                                        >
                                            <CustomMarker
                                                location={session.current_route_trip.extraCricuitData.endLocation}
                                                locationIndex={"·"}
                                                isEndLocation={true}
                                            />
                                        </Marker>
                                    )}
                            </>
                        )}

                        {/* Polyline connecting all markers */}
                        {markerCoordinates.length > 1 && (
                            <Polyline
                                coordinates={markerCoordinates}
                                strokeWidth={4}
                                strokeColor={Colors.Blue500}
                                geodesic={true}
                            />
                        )}
                    </>
                )}
            </MapView>
        </View>
    );
};

export default MyMap;