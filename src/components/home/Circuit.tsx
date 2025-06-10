import React, { useEffect, useMemo, useRef, useState } from 'react'
import { WarpperComponent } from '../common';
import CircuitUI from './CircuitUI';
import BottomSheet from '@gorhom/bottom-sheet';
import { BaseProps, Colors, Fonts, Images } from '../../constants';
import { getPlacesFromGoogle, getPlaceLatLngFromGoogle } from '../../api/LocationAPI';
import { Keyboard, Alert, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import BottomAlertDialog from '../common/BottomAlertDialog';
import LocationDetailsCard from './LocationDetailsCard';
import { navigate } from '../../navigation/RootNavigation';
import { Place, RouteTrip } from '../../model/LocationModel';
import { PlaceItem } from '../../model/LocationModel';
import axios from 'axios';
import ActiveRouteUI from './ActiveRouteUI';
import LottieView from 'lottie-react-native';
import Strings from '../../language/Strings';
import { ScrollView } from 'react-native-gesture-handler';
import { GOOGLE_API_KEY, KEY_ROUTE_TRIP_DATA } from '../../data/storeKey';
import { makeViewDescriptorsSet } from 'react-native-reanimated/lib/typescript/ViewDescriptorsSet';


// Define default start location (can be made configurable)
const DEFAULT_START_LOCATION = {
    latitude: 22.992115,
    longitude: 72.497523
};

interface CircuitProps {
    currentIndex: number;
    onExpand: () => void;
    onCollapse: () => void;
    onFullExpand: () => void;
    session: any;
    setSession: (key: string, value: any) => void;
    navigation: any;
    onActiveRouteLocationPress: (uniqueId: string) => void;
    isOptimizing?: boolean;
    showLocationDetails: boolean;
    setShowLocationDetails: (showLocationDetails: boolean) => void;
}


const Circuit: React.FC<CircuitProps> = ({
    currentIndex,
    onExpand,
    onCollapse,
    onFullExpand,
    session,
    setSession,
    navigation,
    onActiveRouteLocationPress,
    isOptimizing: externalIsOptimizing,
    showLocationDetails,
    setShowLocationDetails
}) => {
    const [searchText, setSearchText] = React.useState('');
    const [placeData, setPlaceData] = React.useState<PlaceItem[]>([]);
    const [routeLocations, setRouteLocations] = useState<Place[]>([]);
    const [extraCricuitData, setExtraCricuitData] = useState<any>({
        startLocation: {
            id: 1,
            title: "Start from current location",
            subtitle: "Use GPS position when optimizing",
        },
        endLocation: {
            id: 1,
            title: "Return to start",
            subtitle: "Roundtrip (recommended)",
        },
        startTime: "",
        endTime: "",
    });
    const [selectedLocation, setSelectedLocation] = useState<Place | null>(null);
    const prevSheetIndex = useRef(currentIndex);
    const [isVisible, setIsVisible] = useState(false);
    const [routeName, setRouteName] = useState("");
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [isRouteOptimized, setIsRouteOptimized] = useState(false);
    const [totalDistance, setTotalDistance] = useState<number>(0);
    const [totalTime, setTotalTime] = useState<number>(0);
    const [locationsHash, setLocationsHash] = useState<string>('');
    const [isRouteStarted, setIsRouteStarted] = useState<boolean>(session?.current_route_trip?.tripStatus === 'started' || false);
    const [currentStartLocation, setCurrentStartLocation] = useState(DEFAULT_START_LOCATION);
    const [isKeyboardVisible, setKeyboardVisible] = React.useState(false);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                setKeyboardVisible(true);
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setKeyboardVisible(false);
            }
        );

        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, []);
    useEffect(() => {
        if (session?.current_route_trip) {
            // Ensure session.route_trip_data is an array, default to an empty array if undefined/null
            let updatedData = Array.isArray(session.route_trip_data) ? [...session.route_trip_data] : [];

            const existingIndex = updatedData.findIndex(
                (trip: RouteTrip) => trip.tripId === session.current_route_trip.tripId
            );

            if (existingIndex !== -1) {
                // If trip exists, update it with new data
                updatedData[existingIndex] = {
                    ...updatedData[existingIndex],
                    ...session.current_route_trip
                };
            } else {
                // If trip does not exist, add new trip data
                updatedData.push(session.current_route_trip);
            }

            // Store updated array in session
            setSession(KEY_ROUTE_TRIP_DATA, updatedData);
        }
    }, [session?.current_route_trip]);

    // Reset selected location when bottom sheet index changes
    useEffect(() => {
        if (currentIndex <= 1) {
            setShowLocationDetails(false);
        }
        prevSheetIndex.current = currentIndex;
    }, [currentIndex]);
    // Load route name from session on mount
    useEffect(() => {

        console.log("session?.current_route_trip", session?.current_route_trip?.routeName);
        if (session?.current_route_trip?.routeName) {
            setRouteName(session.current_route_trip.routeName);
        } else {
            setRouteName("My First Route");
        }

        // Load locations from session
        if (session?.current_route_trip?.locations && session.current_route_trip.locations.length > 0) {
            console.log("Loading locations from session:", session.current_route_trip.locations.length);
            setRouteLocations(session.current_route_trip.locations);
        }

        // Load optimization status, distance and time from session
        if (session?.current_route_trip) {
            setIsRouteOptimized(!!session.current_route_trip.isOptimized);
            setTotalDistance(session.current_route_trip.distance || 0);
            setTotalTime(session.current_route_trip.time || 0);

            // Load extraCricuitData from session if available
            if (session.current_route_trip.extraCricuitData) {
                setExtraCricuitData(session.current_route_trip.extraCricuitData);
            }
        }
    }, [session?.current_route_trip?.routename, session?.current_route_trip?.isOptimized,
    session?.current_route_trip?.distance, session?.current_route_trip?.time,
    session?.current_route_trip?.extraCricuitData, session?.current_route_trip?.locations]);

    // Check if locations have changed since last optimization
    useEffect(() => {
        // Create a unique hash of the current locations to track changes
        const hash = JSON.stringify(routeLocations.map(loc => loc.uniqueId));

        // If locations changed after optimization, reset optimized state
        if (isRouteOptimized && hash !== locationsHash) {
            setIsRouteOptimized(false);

            // Update session
            if (session?.current_route_trip && setSession) {
                const updatedRouteTrip = {
                    ...session.current_route_trip,
                    isOptimized: false,
                    updatedAt: new Date().toISOString()
                };
                setSession('current_route_trip', updatedRouteTrip);
            }
        }
    }, [routeLocations]);

    // Store locations hash after optimization
    useEffect(() => {
        if (isRouteOptimized) {
            const hash = JSON.stringify(routeLocations.map(loc => loc.uniqueId));
            setLocationsHash(hash);
        }
    }, [isRouteOptimized]);

    // Monitor changes in start location
    useEffect(() => {
        // Skip if not yet optimized or if we don't have extraCricuitData
        if (!isRouteOptimized || !extraCricuitData || routeLocations.length < 2) {
            return;
        }

        // Get the stored start location values from the hash
        const storedHash = JSON.stringify({
            startLat: extraCricuitData?.startLocation?.latitude,
            startLng: extraCricuitData?.startLocation?.longitude,
            endLocId: extraCricuitData?.endLocation?.id,
            endLat: extraCricuitData?.endLocation?.latitude,
            endLng: extraCricuitData?.endLocation?.longitude
        });

        // Compare with current values
        const currentHash = JSON.stringify({
            startLat: session?.current_route_trip?.extraCricuitData?.startLocation?.latitude,
            startLng: session?.current_route_trip?.extraCricuitData?.startLocation?.longitude,
            endLocId: session?.current_route_trip?.extraCricuitData?.endLocation?.id,
            endLat: session?.current_route_trip?.extraCricuitData?.endLocation?.latitude,
            endLng: session?.current_route_trip?.extraCricuitData?.endLocation?.longitude
        });

        // If locations have changed since optimization, prompt for re-optimization
        if (storedHash !== currentHash) {
            // Check if start or end locations changed
            const startChanged =
                extraCricuitData?.startLocation?.latitude !== session?.current_route_trip?.extraCricuitData?.startLocation?.latitude ||
                extraCricuitData?.startLocation?.longitude !== session?.current_route_trip?.extraCricuitData?.startLocation?.longitude;

            const endChanged =
                extraCricuitData?.endLocation?.id !== session?.current_route_trip?.extraCricuitData?.endLocation?.id ||
                extraCricuitData?.endLocation?.latitude !== session?.current_route_trip?.extraCricuitData?.endLocation?.latitude ||
                extraCricuitData?.endLocation?.longitude !== session?.current_route_trip?.extraCricuitData?.endLocation?.longitude;

            let message = "";
            if (startChanged && endChanged) {
                message = "Your starting point and end location have changed.";
            } else if (startChanged) {
                message = "Your starting point has changed.";
            } else if (endChanged) {
                message = "Your end location has changed.";
            }

            // Add this check to prevent redirection to active trip
            if (session?.current_route_trip?.tripStatus === 'started') {
                // If route is already started, reset the trip status
                if (setSession) {
                    const updatedRouteTrip = {
                        ...session.current_route_trip,
                        tripStatus: undefined,
                        startTime: undefined,
                        isOptimized: false,
                        updatedAt: new Date().toISOString()
                    };
                    setSession('current_route_trip', updatedRouteTrip);
                }

                // Update local state
                setIsRouteStarted(false);
            }
        }
    }, [session?.current_route_trip?.extraCricuitData?.startLocation, session?.current_route_trip?.extraCricuitData?.endLocation]);

    // Check if route is already started when component mounts
    useEffect(() => {
        if (session?.current_route_trip?.tripStatus === 'started') {
            setIsRouteStarted(true);
        }
    }, [session?.current_route_trip?.tripStatus]);



    // Keep UI in sync with session locations
    useEffect(() => {
        if (session?.current_route_trip?.locations) {
            const sessionLocations = session.current_route_trip.locations;
            // Check if the locations have actually changed to avoid infinite loops
            if (JSON.stringify(sessionLocations) !== JSON.stringify(routeLocations)) {
                console.log("Locations changed in session, updating UI:", sessionLocations.length);
                setRouteLocations(sessionLocations);
            }
        }
    }, [session?.current_route_trip?.locations]);

    // Update currentStartLocation with user's location when available
    useEffect(() => {
        if (session?.user_location?.latitude && session?.user_location?.longitude) {
            // Create a new reference to compare with the current one
            const newLocation = {
                latitude: session.user_location.latitude,
                longitude: session.user_location.longitude
            };

            // Only update if the location has actually changed
            if (newLocation.latitude !== currentStartLocation.latitude ||
                newLocation.longitude !== currentStartLocation.longitude) {
                console.log("Using user's current location as start location:", session.user_location);
                setCurrentStartLocation(newLocation);
            }
        }
    }, [session?.user_location?.latitude, session?.user_location?.longitude]);

    // Sync local isOptimizing state with the prop from MainHome when available
    useEffect(() => {
        if (externalIsOptimizing !== undefined) {
            setIsOptimizing(externalIsOptimizing);
        }
    }, [externalIsOptimizing]);

    // Also sync with session.current_route_trip.isOptimizing
    useEffect(() => {
        if (session?.current_route_trip?.isOptimized !== undefined) {
            console.log("Optimization state changed:", session.current_route_trip.isOptimized);
            setIsRouteOptimized(!!session.current_route_trip.isOptimized);
        }
    }, [session?.current_route_trip?.isOptimized]);

    const handleSearchChange = async (text: string) => {
        // Here you can handle the search text changes
        setSearchText(text);

        // Always load test data when there's text
        if (text.trim()) {
            console.log("Search text:", text);
            // Also try to get data from API in the background
            try {
                const response = await getPlacesFromGoogle(text, "1234", 23.024553, 72.58957);
                if (response && Array.isArray(response) && response.length > 0) {
                    console.log(`Got ${response.length} places from API, updating data`);
                    setPlaceData(response);
                }
            } catch (error) {
                console.error("API error:", error);
                // Keep using test data if API fails
            }
        } else {
            setPlaceData([]);
        }
    };

    const handlePlaceSelect = async (place: PlaceItem) => {
        // Check if current route is completed
        const isCurrentRouteCompleted = session?.current_route_trip?.tripStatus === 'completed';

        // Generate a unique ID for the location
        const uniqueId = `place_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const tripId = isCurrentRouteCompleted ?
            Math.random().toString(36).substr(2, 9) :
            session?.current_route_trip?.tripId || Math.random().toString(36).substr(2, 9);

        // Create the new place object
        const newPlace: Place = {
            title: place.primary_text || '',
            subtitle: place.full_text ? place.full_text.replace(place.primary_text + ", ", "") : '',
            placeId: place.placeId || `place${routeLocations.length + 1}`,
            latitude: place.latitude || 0,
            longitude: place.longitude || 0,
            packageCount: 1,
            orderType: 'auto',
            stopType: 'delivery',
            uniqueId: uniqueId,
        };

        // If latitude or longitude is 0 or null, fetch them using the API
        if (!newPlace.latitude || !newPlace.longitude || newPlace.latitude === 0 || newPlace.longitude === 0) {
            try {
                const placeWithAddress = {
                    ...place,
                    address: place.full_text || '',
                };
                const coordinates = await getPlaceLatLngFromGoogle(placeWithAddress);
                if (coordinates && coordinates.latitude && coordinates.longitude) {
                    newPlace.latitude = coordinates.latitude;
                    newPlace.longitude = coordinates.longitude;
                }
            } catch (coordError) {
                console.error("Error fetching coordinates:", coordError);
            }
        }

        // If current route is completed, create a new route
        if (isCurrentRouteCompleted) {
            const newRouteTrip = {
                tripId: tripId,
                routeName: "My New Route",
                locations: [newPlace],
                date: new Date().toISOString(),
                isOptimized: false,
                updatedAt: new Date().toISOString(),
                extraCricuitData: {
                    startLocation: {
                        id: 1,
                        title: "Start from current location",
                        subtitle: "Use GPS position when optimizing",
                    },
                    endLocation: {
                        id: 1,
                        title: "Return to start",
                        subtitle: "Roundtrip (recommended)",
                    },
                    startTime: "",
                    endTime: "",
                }
            };
            setSession('current_route_trip', newRouteTrip);
        } else {
            // Add to existing route
            const updatedLocations = [...routeLocations, newPlace];
            const updatedRouteTrip = {
                ...session.current_route_trip,
                locations: updatedLocations,
                updatedAt: new Date().toISOString(),
                isOptimized: false,
                tripId: tripId,
                date: session?.current_route_trip?.date || new Date().toISOString(),
                routeName: session?.current_route_trip?.routeName || "My Route"
            };
            setSession('current_route_trip', updatedRouteTrip);
        }

        // Show location details
        setSelectedLocation(newPlace);
        setShowLocationDetails(true);

        // Clear search text and hide keyboard
        setSearchText('');
        setPlaceData([]);
        Keyboard.dismiss();
    };

    const handleLocationClick = (location: Place) => {
        console.log("Location clicked:", location);
        setSelectedLocation(location);
        setIsVisible(true);
    };

    const handleCloseLocationDetails = () => {
        setShowLocationDetails(false);
        setSelectedLocation(null);
    };

    const handleChangeAddress = () => {
        console.log("Change address for location:", selectedLocation);
        setIsVisible(false);
        if (selectedLocation) {

            navigate("ChangeLocation", {
                onDone: (place: any) => {
                    console.log("Place selected in RouteDetails:", place);

                    const location = session?.current_route_trip?.locations?.find((loc: { uniqueId: string | undefined; }) => loc.uniqueId === selectedLocation.uniqueId);
                    if (location) {
                        location.uniqueId = selectedLocation?.uniqueId;
                        location.packageCount = selectedLocation?.packageCount;
                        location.orderType = selectedLocation?.orderType;
                        location.stopType = selectedLocation?.stopType;
                        location.isCompleted = selectedLocation?.isCompleted;
                        location.deliveryTime = selectedLocation?.deliveryTime;
                        location.status = selectedLocation?.status;
                        location.statusUpdateTime = selectedLocation?.statusUpdateTime;
                        location.title = place.primary_text;
                        location.subtitle = place.address ? place.full_text.replace(place.address + ", ", "") : '';
                        location.latitude = place.latitude;
                        location.longitude = place.longitude;
                        location.placeId = place.placeId;
                    }
                    handleSessionUpdate("selectedLocation", location);

                    setIsRouteOptimized(false);
                    setShowLocationDetails(false);
                }
            })
        }
    };

    const handleDuplicateStop = () => {
        setIsVisible(false);
        if (selectedLocation) {
            const duplicatedLocation = {
                ...selectedLocation,
                id: routeLocations.length + 1,
                uniqueId: `duplicated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            };

            // Add duplicated location to the route
            setRouteLocations(prevLocations => [...prevLocations, duplicatedLocation]);

            // Update route trip in session
            const current_route_trip = session?.current_route_trip;
            if (current_route_trip && setSession) {
                const updatedRouteTrip = {
                    ...current_route_trip,
                    locations: [...current_route_trip.locations, duplicatedLocation],
                    updatedAt: new Date().toISOString(),
                    isOptimized: false
                };
                setSession('current_route_trip', updatedRouteTrip);
            }

            // Reset optimization status
            setIsRouteOptimized(false);
            setShowLocationDetails(false);
        }
    };

    const handleRemoveStop = () => {
        setIsVisible(false);
        if (selectedLocation) {
            // Remove location from route
            setRouteLocations(prevLocations =>
                prevLocations.filter(location => location.uniqueId !== selectedLocation.uniqueId)
            );

            // Update route trip in session
            const current_route_trip = session?.current_route_trip;
            if (current_route_trip && setSession) {
                const updatedRouteTrip = {
                    ...current_route_trip,
                    locations: current_route_trip.locations.filter(
                        (location: Place) => location.uniqueId !== selectedLocation.uniqueId
                    ),
                    updatedAt: new Date().toISOString(),
                    isOptimized: false // Reset optimization flag when removing locations
                };
                setSession('current_route_trip', updatedRouteTrip);
            }

            // Reset optimization status
            setIsRouteOptimized(false);
            setShowLocationDetails(false);
            setSelectedLocation(null);
        }
    };

    // Update location in route locations array and session
    const updateLocationInRoute = (updatedLocation: Place) => {
        console.log("Updating location in route:", updatedLocation);

        setRouteLocations(prevLocations =>
            prevLocations.map(location =>
                location.uniqueId === updatedLocation.uniqueId ? updatedLocation : location
            )
        );

        // Update the location in the route trip in session
        const current_route_trip = session?.current_route_trip;
        if (current_route_trip && setSession) {
            const updatedRouteTrip = {
                ...current_route_trip,
                locations: current_route_trip.locations.map((location: Place) =>
                    location.uniqueId === updatedLocation.uniqueId ? updatedLocation : location
                ),
                updatedAt: new Date().toISOString(),
                isOptimized: false // Reset optimization flag when locations are modified
            };
            setSession('current_route_trip', updatedRouteTrip);

            // Reset optimization status
            setIsRouteOptimized(false);
        }
    };

    // Handle session updates
    const handleSessionUpdate = (key: string, value: any) => {
        console.log("Updating session with:", key, value);

        // Update session through the prop
        if (setSession) {
            if (key === 'selectedLocation' && value) {
                // Update the location in both local state and route trip
                updateLocationInRoute(value);
                setSelectedLocation(value);
            } else {
                setSession(key, value);
            }
        }
    };

    const handleRouteDetails = (fromBreak: boolean) => {
        navigate("RouteDetails", {
            fromBreak: fromBreak,
            onDone: (newExtraCricuitData: any) => {
                console.log("Extra circuit data:", newExtraCricuitData);

                // Check if start location has changed
                const startLocationChanged =
                    extraCricuitData?.startLocation?.latitude !== newExtraCricuitData?.startLocation?.latitude ||
                    extraCricuitData?.startLocation?.longitude !== newExtraCricuitData?.startLocation?.longitude;

                // Check if end location has changed
                const endLocationChanged =
                    extraCricuitData?.endLocation?.id !== newExtraCricuitData?.endLocation?.id ||
                    extraCricuitData?.endLocation?.latitude !== newExtraCricuitData?.endLocation?.latitude ||
                    extraCricuitData?.endLocation?.longitude !== newExtraCricuitData?.endLocation?.longitude;

                // Save the new extra circuit data
                setExtraCricuitData(newExtraCricuitData);

                // Reset optimization when route details change or locations change
                setIsRouteOptimized(false);

                // If route is active and locations changed, reset trip status
                if ((startLocationChanged || endLocationChanged) &&
                    session?.current_route_trip?.tripStatus === 'started') {
                    if (setSession) {
                        const updatedRouteTrip = {
                            ...session.current_route_trip,
                            tripStatus: undefined,
                            startTime: undefined,
                            isOptimized: false,
                            extraCricuitData: newExtraCricuitData,
                            updatedAt: new Date().toISOString()
                        };
                        setSession('current_route_trip', updatedRouteTrip);
                    }
                    // Update local state
                    setIsRouteStarted(false);
                } else {
                    // Update session with the new extra circuit data
                    if (session?.current_route_trip && setSession) {
                        const updatedRouteTrip = {
                            ...session.current_route_trip,
                            extraCricuitData: newExtraCricuitData,
                            isOptimized: false,
                            updatedAt: new Date().toISOString()
                        };
                        setSession('current_route_trip', updatedRouteTrip);
                    }
                }

                // If any location has changed and we already have an optimized route, 
                // suggest re-optimization to the user
                if ((startLocationChanged || endLocationChanged) && routeLocations.length > 1) {
                    let message = "";
                    if (startLocationChanged && endLocationChanged) {
                        message = "The starting point and end location of your route have changed.";
                    } else if (startLocationChanged) {
                        message = "The starting point of your route has changed.";
                    } else if (endLocationChanged) {
                        message = "The end location of your route has changed.";
                    }
                }
            }
        })
    };

    const handleChangeRouteName = (newName: string) => {
        setRouteName(newName);
        const updatedRouteTrip = {
            ...session.current_route_trip,
            routeName: newName.trim(),
            updatedAt: new Date().toISOString()
        };
        setSession('current_route_trip', updatedRouteTrip);
    };

    // Start route navigation
    const handleStartRoute = () => {
        // Check if the route is optimized
        if (!isRouteOptimized) {
            Alert.alert(
                "Route Not Optimized",
                "Please optimize your route before starting navigation.",
                [{ text: "OK" }]
            );
            return;
        }

        // Check if there are locations in the route
        if (routeLocations.length === 0) {
            Alert.alert(
                "No Locations",
                "Please add at least one location to your route.",
                [{ text: "OK" }]
            );
            return;
        }

        // Set the route as started in the session
        const currentTime = new Date().toISOString();

        if (session?.current_route_trip && setSession) {
            const updatedRouteTrip = {
                ...session.current_route_trip,
                tripStatus: 'started',
                startTime: currentTime,
                updatedAt: currentTime
            };
            setSession('current_route_trip', updatedRouteTrip);
        }

        // Update local state
        setIsRouteStarted(true);
    };

    // Handle marking a location as completed
    const handleMarkLocationCompleted = (location: Place) => {
        if (!location.uniqueId) return;

        const currentTime = new Date().toISOString();

        // Update location in local state
        const updatedLocations = routeLocations.map(loc =>
            loc.uniqueId === location.uniqueId
                ? { ...loc, isCompleted: true, deliveryTime: currentTime }
                : loc
        );

        setRouteLocations(updatedLocations);

        // Update location in session
        if (session?.current_route_trip && setSession) {
            const updatedRouteTrip = {
                ...session.current_route_trip,
                locations: updatedLocations,
                updatedAt: currentTime
            };
            setSession('current_route_trip', updatedRouteTrip);
        }
    };

    // Handle ending the route
    const handleEndRoute = () => {
        // Check if all locations are completed
        const allCompleted = routeLocations.every(loc => loc.isCompleted);

        if (!allCompleted) {
            Alert.alert(
                "Incomplete Stops",
                "Not all stops have been completed. Are you sure you want to end this route?",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "End Route",
                        style: "destructive",
                        onPress: () => completeRoute()
                    }
                ]
            );
        } else {
            completeRoute();
        }
    };

    const handlePinOnMap = () => {
        navigate("LocationFromPin", {
            onDone: (place: PlaceItem) => {
                handlePlaceSelect(place)
            }
        });
    }

    // Complete the route
    const completeRoute = () => {
        const currentTime = new Date().toISOString();

        if (session?.current_route_trip && setSession) {
            const updatedRouteTrip = {
                ...session.current_route_trip,
                tripStatus: 'completed',
                endTime: currentTime,
                updatedAt: currentTime
            };
            setSession('current_route_trip', updatedRouteTrip);
        }

        // Reset route state
        setIsRouteStarted(false);

        // Show confirmation
        Alert.alert(
            "Route Completed",
            "Your route has been marked as completed.",
            [{
                text: "OK", onPress: () => {
                    setIsRouteStarted(false);
                    setIsRouteOptimized(false);
                    setRouteLocations([]);
                    setExtraCricuitData(null);
                    setSession('current_route_trip', undefined);
                }
            }]
        );
    };

    // Add more stops to an active route
    const handleAddMoreStops = () => {
        // This will return to the regular search UI while keeping the route active
        if (onCollapse) {
            onCollapse();
        }
    };

    // New function to optimize route with specific locations
    const optimizeWithLocations = async (locations: Place[]) => {
        try {
            console.log("Starting custom optimization with locations:", locations.length);

            if (locations.length < 2) {
                Alert.alert("Not enough locations", "Please add at least 2 locations to optimize the route");
                return;
            }

            setIsOptimizing(true);
            setIsRouteOptimized(false);

            // Update session with optimizing status
            if (setSession && session?.current_route_trip) {
                const updatingTrip = {
                    ...session.current_route_trip,
                    isOptimizing: true,
                    updatedAt: new Date().toISOString()
                };
                setSession('current_route_trip', updatingTrip);
            }

            // Determine start and end locations
            let startLocation;
            let endLocation;

            // Prioritize start location from extraCricuitData
            if (extraCricuitData?.startLocation?.latitude && extraCricuitData?.startLocation?.longitude) {
                startLocation = {
                    latitude: extraCricuitData.startLocation.latitude,
                    longitude: extraCricuitData.startLocation.longitude
                };
            } else {
                // Use current location as start location if available, otherwise use default
                startLocation = currentStartLocation;
            }
            console.log("extraCricuitDataextraCricuitData", extraCricuitData);

            // Handle end location based on the three possible cases
            if (extraCricuitData?.endLocation) {
                if (extraCricuitData.endLocation.id === 1) {
                    console.log("Using start location as end (roundtrip)");
                    endLocation = startLocation;
                } else if (extraCricuitData.endLocation.id === 2 &&
                    extraCricuitData.endLocation.latitude &&
                    extraCricuitData.endLocation.longitude) {
                    console.log("Using custom end location");
                    endLocation = {
                        latitude: extraCricuitData.endLocation.latitude,
                        longitude: extraCricuitData.endLocation.longitude
                    };
                } else if (extraCricuitData.endLocation.id === 3) {
                    console.log("Using last stop as end");
                    endLocation = locations[locations.length - 1];
                } else {
                    console.log("Using start location as end (roundtrip)");
                    endLocation = startLocation;
                }
            } else {
                console.log("Using start location as end (roundtrip)");
                endLocation = startLocation;
            }

            console.log("Optimizing route with:", locations.length, "locations");

            // 1. Construct waypoint string for all locations
            const waypoints = locations
                .map((loc) => `${loc.latitude},${loc.longitude}`)
                .join("|");

            // 2. Fetch optimized directions from Google Routes API
            const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${startLocation.latitude},${startLocation.longitude}&destination=${endLocation.latitude},${endLocation.longitude}&waypoints=optimize:true|${waypoints}&key=${GOOGLE_API_KEY}`;

            const response = await axios.get(directionsUrl);

            if (response.data.status === "OK") {
                const optimizedWaypoints = response.data.routes[0].waypoint_order;
                console.log("Got optimized waypoint order:", optimizedWaypoints);

                // Create new array of optimized locations
                const optimizedLocations = optimizedWaypoints.map((index: number, newIndex: number) => {
                    return {
                        ...locations[index],
                        id: newIndex + 1 // Update the ID for display order
                    };
                });

                console.log("Optimized locations count:", optimizedLocations.length);

                // Get total distance and time from route
                let distance = 0;
                let time = 0;

                if (response.data.routes[0].legs) {
                    response.data.routes[0].legs.forEach((leg: any) => {
                        if (leg.distance && leg.distance.value) {
                            distance += leg.distance.value; // Distance in meters
                        }
                        if (leg.duration && leg.duration.value) {
                            time += leg.duration.value; // Time in seconds
                        }
                    });
                }

                // Convert distance to kilometers and time to minutes
                distance = Math.round(distance / 100) / 10;
                time = Math.round(time / 60);

                // Update local state with optimized locations
                setRouteLocations(optimizedLocations);
                setTotalDistance(distance);
                setTotalTime(time);
                setIsRouteOptimized(true);

                // Store locations hash to track changes
                const hash = JSON.stringify(optimizedLocations.map((loc: Place) => loc.uniqueId));
                setLocationsHash(hash);

                // Use setTimeout to avoid state update conflicts
                setTimeout(() => {
                    // Update session with final optimization results
                    if (setSession && session?.current_route_trip) {
                        const finalTrip = {
                            ...session.current_route_trip,
                            locations: optimizedLocations,
                            distance,
                            time,
                            isOptimized: true,
                            isOptimizing: false,
                            extraCricuitData,
                            updatedAt: new Date().toISOString(),
                            date: session?.current_route_trip?.date || new Date().toISOString()
                        };

                        console.log("Saving optimized route with locations:", optimizedLocations.length);
                        setSession('current_route_trip', finalTrip);
                    }

                    // Update local state
                    setIsOptimizing(false);
                }, 500);

            } else {
                console.error("Error fetching directions:", response.data.status);
                Alert.alert("Optimization Failed", "Could not optimize the route. Please try again.");

                // Update session to clear optimizing state
                if (setSession && session?.current_route_trip) {
                    const failedTrip = {
                        ...session.current_route_trip,
                        isOptimizing: false,
                        updatedAt: new Date().toISOString()
                    };
                    setSession('current_route_trip', failedTrip);
                }

                setIsOptimizing(false);
            }
        } catch (error) {
            console.error("Error optimizing route:", error);
            Alert.alert("Optimization Error", "An error occurred while optimizing the route");

            // Update session to clear optimizing state
            if (setSession && session?.current_route_trip) {
                const errorTrip = {
                    ...session.current_route_trip,
                    isOptimizing: false,
                    updatedAt: new Date().toISOString()
                };
                setSession('current_route_trip', errorTrip);
            }

            setIsOptimizing(false);
        }
    };

    // Modify the handleOptimizeRoute function to use our new optimizeWithLocations function
    const handleOptimizeRoute = async () => {
        // If route is already optimized, start navigation
        if (isRouteOptimized) {
            handleStartRoute();
            return;
        }

        // Set optimizing state in session
        if (session?.current_route_trip && setSession) {
            setIsOptimizing(true);
            const updatedRouteTrip = {
                ...session.current_route_trip,
                requestOptimize: true,
                isOptimizing: true,
                isOptimized: false, // Reset optimized state when starting optimization
                updatedAt: new Date().toISOString()
            };
            setSession('current_route_trip', updatedRouteTrip);
        }
    };

    return (
        <View style={{ flex: 1, height: '100%', width: '100%' }}>
            <View style={{ flex: 1, maxHeight: "100%", }}>
                <CircuitUI
                    currentIndex={currentIndex}
                    onExpand={onExpand}
                    onCollapse={onCollapse}
                    onFullExpand={onFullExpand}
                    session={session}
                    navigation={navigation}
                    onSearchChange={handleSearchChange}
                    searchText={searchText}
                    placeData={placeData}
                    onPlaceSelect={handlePlaceSelect}
                    routeLocations={routeLocations}
                    selectedLocation={selectedLocation}
                    showLocationDetails={showLocationDetails}
                    onLocationClick={handleLocationClick}
                    onCloseLocationDetails={handleCloseLocationDetails}
                    onChangeAddress={handleChangeAddress}
                    onDuplicateStop={handleDuplicateStop}
                    onRemoveStop={handleRemoveStop}
                    onRouteDetails={handleRouteDetails}
                    extraCricuitData={extraCricuitData}
                    onChangeRouteName={handleChangeRouteName}
                    routeName={routeName}
                    isOptimizing={isOptimizing}
                    isRouteOptimized={isRouteOptimized}
                    totalDistance={totalDistance}
                    totalTime={totalTime}
                    isRouteStarted={isRouteStarted}
                    onMarkAsCompleted={handleMarkLocationCompleted}
                    onEndRoute={handleEndRoute}
                    onActiveRouteLocationPress={onActiveRouteLocationPress}
                    onPinOnMap={handlePinOnMap}
                    handleSessionUpdate={handleSessionUpdate}
                    isRouteCompleted={session?.current_route_trip?.tripStatus === 'completed' || false}
                />
            </View>
            <BottomAlertDialog
                visible={isVisible}
                cancelable={true}
                extraView={
                    <LocationDetailsCard
                        location={selectedLocation || {
                            title: '',
                            subtitle: '',
                            placeId: '',
                            latitude: 0,
                            longitude: 0,
                            packageCount: 1,
                            orderType: 'auto',
                            stopType: 'delivery'
                        }}
                        onClose={() => {
                            setIsVisible(false);
                            setShowLocationDetails(false);
                        }}
                        onChangeAddress={handleChangeAddress}
                        onDuplicateStop={handleDuplicateStop}
                        onRemoveStop={handleRemoveStop}
                        onPackageCountChange={(count) => {
                            if (selectedLocation) {
                                const updatedLocation = { ...selectedLocation, packageCount: count };
                                handleSessionUpdate('selectedLocation', updatedLocation);
                            }
                        }}
                        onOrderTypeChange={(orderType) => {
                            if (selectedLocation) {
                                const updatedLocation = { ...selectedLocation, orderType };
                                handleSessionUpdate('selectedLocation', updatedLocation);
                            }
                        }}
                        onStopTypeChange={(stopType) => {
                            if (selectedLocation) {
                                const updatedLocation = { ...selectedLocation, stopType };
                                handleSessionUpdate('selectedLocation', updatedLocation);
                            }
                        }}
                        onPackageFinderChange={(data) => {
                            if (selectedLocation) {
                                const updatedLocation = { ...selectedLocation, packageFinder: data };
                                handleSessionUpdate('selectedLocation', updatedLocation);
                            }
                        }}
                        onArrivalTimeChange={(data) => {
                            if (selectedLocation) {
                                const updatedLocation = { ...selectedLocation, arrivalTime: data };
                                handleSessionUpdate('selectedLocation', updatedLocation);
                            }
                        }}
                        onTimeAtStopChange={(data) => {
                            if (selectedLocation) {
                                const updatedLocation = { ...selectedLocation, timeAtStop: data };
                                handleSessionUpdate('selectedLocation', updatedLocation);
                            }
                        }}
                        onNotesChange={(notes) => {
                            if (selectedLocation) {
                                const updatedLocation = { ...selectedLocation, locationNotes: notes };
                                handleSessionUpdate('selectedLocation', updatedLocation);
                            }
                        }}
                        showHeader={true}
                    />
                }
                onDismiss={() => {
                    setIsVisible(false)
                    setShowLocationDetails(false)
                }}
            />
        </View>
    )
}

export default Circuit;