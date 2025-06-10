import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button, WarpperComponent } from '../common'
import { BaseProps, Colors, Fonts, Images, Utils } from '../../constants'
import { StyleSheet, Text, View, TouchableOpacity, Image, Platform, KeyboardAvoidingView, Alert, Keyboard, StatusBar } from 'react-native'
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps'; // remove PROVIDER_GOOGLE import if not using Google Maps
import MyMap from '../common/MyMap';
import BottomSheet, { BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import Strings from '../../language/Strings';
import Circuit from './Circuit';
import { Place } from '../../model/LocationModel';
import LocationActionSheet from './LocationActionSheet';
import LottieView from 'lottie-react-native';
import { KEY_CURRENT_ROUTE_TRIP, KEY_ROUTE_TRIP_DATA } from '../../data/storeKey';
import axios from 'axios';
import { getPlacesFromGoogle, getPlaceLatLngFromGoogle } from '../../api/LocationAPI';
import { useTheme } from '../../context/ThemeContext';

// Add environment variable for Google API Key (should be moved to env config)
const GOOGLE_API_KEY = "AIzaSyAp06fIsyzm4yqKKB8Kh0RZV-oZesD30OQ"; // Replace with your actual API key

// Define default start location (can be made configurable)
const DEFAULT_START_LOCATION = {
    latitude: 22.992115,
    longitude: 72.497523
};

interface PlaceItem {
    primary_text: string;
    full_text: string;
    placeId: string;
    latitude: number;
    longitude: number;
}

const MainHome: React.FC<BaseProps> = ({ session, setSession, navigation }) => {
    const { theme, setTheme, isDarkMode } = useTheme();
    const bottomSheetRef = useRef<BottomSheet>(null);
    const locationActionSheetRef = useRef<BottomSheet>(null);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [isBottomSheetReady, setIsBottomSheetReady] = useState(false);
    const [isActionSheetReady, setIsActionSheetReady] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<Place | null>(null);
    const [activeLocationIndex, setActiveLocationIndex] = useState<number>(0);
    const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const [showLocationDetails, setShowLocationDetails] = useState(false);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [currentStartLocation, setCurrentStartLocation] = useState(DEFAULT_START_LOCATION);
    const [locationsHash, setLocationsHash] = useState<string>('');
    const [searchText, setSearchText] = useState('');
    const [placeData, setPlaceData] = useState<PlaceItem[]>([]);

    // Get these values from session
    const routeLocations = session?.current_route_trip?.locations || [];
    const isRouteOptimized = session?.current_route_trip?.isOptimized || false;
    const isRouteStarted = session?.current_route_trip?.tripStatus === 'started';

    // Monitor optimization status from session
    // useEffect(() => {
    //     setIsOptimizing(!!session?.current_route_trip?.isOptimizing);
    // }, [session?.current_route_trip?.isOptimizing]);

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
        // Initialize bottom sheets after component mount
        const initializeBottomSheets = async () => {
            try {
                // Wait for a short delay to ensure component is mounted
                await new Promise(resolve => setTimeout(resolve, 500));
                setIsBottomSheetReady(true);
                setIsActionSheetReady(true);
                // Wait for another frame before setting index
                requestAnimationFrame(() => {
                    setCurrentIndex(1);
                    setIsInitialized(true);
                });
            } catch (error) {
                console.error('Error initializing bottom sheets:', error);
            }
        };

        initializeBottomSheets();

        return () => {
            setIsBottomSheetReady(false);
            setIsActionSheetReady(false);
            setIsInitialized(false);
        };
    }, []);

    useEffect(() => {
        if (isKeyboardVisible) {
            fullExpandSheet();
        }
    }, [isKeyboardVisible]);

    const snapPoints = useMemo(() => ['30%', '50%', '85%', '100%'], []);
    const actionSheetSnapPoints = useMemo(() => ['50%'], []);

    const handleSheetChanges = useCallback((index: number) => {
        console.log('handleSheetChanges', index);
        if (!isInitialized) return;

        if (index >= -1 && index < snapPoints.length) {
            console.log('handleSheetChanges', index);
            setCurrentIndex(index);
        } else {
            console.warn(`Invalid index: ${index}, must be between -1 and ${snapPoints.length - 1}`);
        }
    }, [isInitialized, snapPoints.length]);

    const expandSheet = useCallback(() => {
        console.log('expandSheet');
        if (!isInitialized) return;
        if (bottomSheetRef.current && snapPoints.length > 1) {
            bottomSheetRef.current.snapToIndex(2);
        }
    }, [isInitialized, snapPoints.length]);

    const fullExpandSheet = useCallback(() => {
        console.log('fullExpandSheet');
        if (!isInitialized) return;
        if (bottomSheetRef.current) {
            bottomSheetRef.current.snapToIndex(snapPoints.length - 1);
        }
    }, [isInitialized, snapPoints.length]);

    const collapseSheet = useCallback(() => {
        console.log('collapseSheet');
        if (!isInitialized) return;
        if (bottomSheetRef.current) {
            bottomSheetRef.current.snapToIndex(1);
        }
    }, [isInitialized]);

    const handleActiveRouteLocationPress = useCallback((uniqueId: string) => {
        console.log('handleActiveRouteLocationPress', uniqueId);

        // Find the location with the matching uniqueId
        const location = session?.current_route_trip?.locations?.find(
            (loc: Place) => loc.uniqueId === uniqueId
        );

        if (location) {
            setSelectedLocation(location);

            // Find the index of the selected location
            const locationIndex = session?.current_route_trip?.locations?.findIndex(
                (loc: Place) => loc.uniqueId === uniqueId
            );

            // Only set the index if it's a valid number and not -1
            if (typeof locationIndex === 'number' && locationIndex >= 0) {
                setActiveLocationIndex(locationIndex);
            }

            // Completely close the main bottom sheet
            bottomSheetRef.current?.close();

            // Then open the action sheet after a short delay
            setTimeout(() => {
                locationActionSheetRef.current?.snapToIndex(0);
                setIsActionSheetOpen(true);
            }, 300);
        }
    }, [session?.current_route_trip?.locations]);

    const handleLocationPageChange = useCallback((index: number, location: Place) => {
        console.log('Page changed to:', index, location.title);
        setSelectedLocation(location);
        setActiveLocationIndex(index);
    }, []);

    const handleLocationAction = useCallback((action: string) => {
        console.log('handleLocationAction', action);

        if (!selectedLocation) return;

        // If the action is undo_status, remove the status of the location
        if (action === 'undo_status') {
            const currentTime = new Date().toISOString();
            const updatedLocations = session?.current_route_trip?.locations.map((loc: Place) =>
                loc.uniqueId === selectedLocation.uniqueId
                    ? {
                        ...loc,
                        status: undefined,
                        statusUpdateTime: undefined
                    }
                    : loc
            );

            if (session?.current_route_trip && setSession) {
                const updatedRouteTrip = {
                    ...session.current_route_trip,
                    locations: updatedLocations,
                    updatedAt: currentTime
                };
                setSession('current_route_trip', updatedRouteTrip);
            }

            return;
        }

        // For other actions, proceed with normal flow
        const currentTime = new Date().toISOString();
        const updatedLocations = session?.current_route_trip?.locations.map((loc: Place) =>
            loc.uniqueId === selectedLocation.uniqueId
                ? {
                    ...loc,
                    status: action,
                    statusUpdateTime: currentTime
                }
                : loc
        );

        // Update the session with the updated location status
        if (session?.current_route_trip && setSession) {
            const updatedRouteTrip = {
                ...session.current_route_trip,
                locations: updatedLocations,
                updatedAt: currentTime
            };
            setSession('current_route_trip', updatedRouteTrip);
        }

    }, [selectedLocation, session, setSession]);

    const handleActionSheetClose = useCallback(() => {
        // Re-open the main bottom sheet when action sheet is dismissed
        locationActionSheetRef.current?.close();
        setIsActionSheetOpen(false);

        setTimeout(() => {
            bottomSheetRef.current?.snapToIndex(2);
            setSelectedLocation(null);
        }, 300);
    }, []);

    // Button handler functions moved from Circuit
    const handleStartRoute = useCallback(() => {
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
    }, [isRouteOptimized, routeLocations, session, setSession]);

    const handleEndRoute = useCallback(() => {
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
    }, [routeLocations]);

    const completeRoute = useCallback(() => {
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

        // Show confirmation
        Alert.alert(
            "Route Completed",
            "Your route has been marked as completed.",
            [{
                text: "OK"
            }]
        );
    }, [session, setSession]);

    // New function to optimize route with specific locations
    const optimizeWithLocations = async (locations: Place[], extraCricuitData: any) => {
        try {
            console.log("Starting custom optimization with locations:", locations.length);

            if (locations.length < 2) {
                Alert.alert("Not enough locations", "Please add at least 2 locations to optimize the route");
                return;
            }

            setIsOptimizing(true);

            // Update session with optimizing status
            if (setSession && session?.current_route_trip) {
                const updatingTrip = {
                    ...session.current_route_trip,
                    isOptimizing: true,
                    isOptimized: false, // Reset optimized state while optimizing
                    updatedAt: new Date().toISOString()
                };
                setSession('current_route_trip', updatingTrip);
            }

            // Separate locations by orderType
            const firstLocations = locations.filter(loc => loc.orderType === 'first');
            const lastLocations = locations.filter(loc => loc.orderType === 'last');
            const autoLocations = locations.filter(loc => loc.orderType === 'auto');

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
                startLocation = currentStartLocation;
            }

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

            // Prepare locations for optimization
            let locationsToOptimize = [...autoLocations];
            let optimizedLocations: Place[] = [];
            let routeResponse: any = null;

            // If we have first locations, add them at the beginning
            if (firstLocations.length > 0) {
                // Add all first locations in their original order
                optimizedLocations.push(...firstLocations);
            }

            // Optimize the middle locations if we have any
            if (locationsToOptimize.length > 0) {
                console.log("Optimizing middle locations:", locationsToOptimize.length);

                // Construct waypoint string for middle locations
                const waypoints = locationsToOptimize
                    .map((loc) => `${loc.latitude},${loc.longitude}`)
                    .join("|");

                // Fetch optimized directions from Google Routes API
                const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${startLocation.latitude},${startLocation.longitude}&destination=${endLocation.latitude},${endLocation.longitude}&waypoints=optimize:true|${waypoints}&key=${GOOGLE_API_KEY}`;

                routeResponse = await axios.get(directionsUrl);

                if (routeResponse.data.status === "OK") {
                    const optimizedWaypoints = routeResponse.data.routes[0].waypoint_order;
                    const polyLine = routeResponse.data.routes[0].overview_polyline.points;
                    console.log("Got optimized waypoint order:", routeResponse.data);

                    // Create optimized array of middle locations
                    const optimizedMiddleLocations = optimizedWaypoints.map((index: number, newIndex: number) => {
                        return {
                            ...locationsToOptimize[index],
                            locationOrder: newIndex + 1
                        };
                    });

                    // Add optimized middle locations to the final array
                    optimizedLocations = [...optimizedLocations, ...optimizedMiddleLocations];

                    // Update locationOrder for all locations to ensure proper display order
                    optimizedLocations = optimizedLocations.map((loc, index) => ({
                        ...loc,
                        locationOrder: index + 1
                    }));

                    console.log("Final optimized locations count:", optimizedLocations.length);

                    // Get total distance and time from route
                    let distance = 0;
                    let time = 0;

                    if (routeResponse.data.routes[0].legs) {
                        routeResponse.data.routes[0].legs.forEach((leg: any) => {
                            if (leg.distance && leg.distance.value) {
                                distance += leg.distance.value;
                            }
                            if (leg.duration && leg.duration.value) {
                                time += leg.duration.value;
                            }
                        });
                    }

                    // Convert distance to kilometers and time to minutes
                    distance = Math.round(distance / 100) / 10;
                    time = Math.round(time / 60);

                    // Store locations hash to track changes
                    const hash = JSON.stringify(optimizedLocations.map((loc: Place) => loc.uniqueId));
                    setLocationsHash(hash);

                    // Update session with final optimization results immediately
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
                            date: session?.current_route_trip?.date || new Date().toISOString(),
                            polyline: polyLine
                        };

                        console.log("Saving optimized route with locations:", optimizedLocations.length);
                        setSession('current_route_trip', finalTrip);
                    }

                    // Update local state
                    setIsOptimizing(false);
                } else {
                    console.error("Error fetching directions:", routeResponse.data.status);
                    Alert.alert("Optimization Failed", "Could not optimize the route. Please try again.");

                    // Update session to clear optimizing state
                    if (setSession && session?.current_route_trip) {
                        const failedTrip = {
                            ...session.current_route_trip,
                            isOptimizing: false,
                            isOptimized: false, // Reset optimized state on failure
                            updatedAt: new Date().toISOString()
                        };
                        setSession('current_route_trip', failedTrip);
                    }

                    setIsOptimizing(false);
                }
            }

            // If we have last locations, add them at the end
            if (lastLocations.length > 0) {
                // Add all last locations in their original order
                optimizedLocations.push(...lastLocations);
            }

            // Update locationOrder for all locations to ensure proper display order
            optimizedLocations = optimizedLocations.map((loc, index) => ({
                ...loc,
                locationOrder: index + 1
            }));

            console.log("Final optimized locations count:", optimizedLocations.length);

            // Get total distance and time from route
            let distance = 0;
            let time = 0;

            if (routeResponse?.data?.routes[0]?.legs) {
                routeResponse.data.routes[0].legs.forEach((leg: any) => {
                    if (leg.distance && leg.distance.value) {
                        distance += leg.distance.value;
                    }
                    if (leg.duration && leg.duration.value) {
                        time += leg.duration.value;
                    }
                });
            }

            // Convert distance to kilometers and time to minutes
            distance = Math.round(distance / 100) / 10;
            time = Math.round(time / 60);

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

        } catch (error) {
            console.error("Error optimizing route:", error);
            Alert.alert("Optimization Error", "An error occurred while optimizing the route");

            // Update session to clear optimizing state
            if (setSession && session?.current_route_trip) {
                const errorTrip = {
                    ...session.current_route_trip,
                    isOptimizing: false,
                    isOptimized: false, // Reset optimized state on error
                    updatedAt: new Date().toISOString()
                };
                setSession('current_route_trip', errorTrip);
            }

            setIsOptimizing(false);
        }
    };

    const handleOptimizeRoute = useCallback(() => {
        // If route is already optimized, start navigation
        if (isRouteOptimized) {
            handleStartRoute();
            return;
        }

        // Get current locations and extraCricuitData from session
        const currentLocations = session?.current_route_trip?.locations || [];
        const currentExtraCricuitData = session?.current_route_trip?.extraCricuitData;

        // Start optimization
        optimizeWithLocations(currentLocations, currentExtraCricuitData);
    }, [isRouteOptimized, handleStartRoute, session?.current_route_trip]);

    return (
        // <KeyboardAvoidingView
        //     behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        //     style={[styles.mainContainer, { backgroundColor: Colors.Background(isDarkMode) }]}
        // >
        <View style={[styles.mainContainer, { backgroundColor: Colors.Background(isDarkMode) }]}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={Colors.Background(isDarkMode)} />
            <View style={styles.mapContainer}>
                <MyMap
                    session={session}
                    setSession={setSession}
                />
                <TouchableOpacity
                    style={[styles.menuButton, { backgroundColor: Colors.Background(isDarkMode) }]}
                    onPress={() => navigation.openDrawer()}
                >
                    {/* <Image
                        source={Images.ic_drawer_menu}
                        style={styles.menuIcon}
                        /> */}
                    <LottieView source={Images.Burger_Menu}
                        autoPlay
                        // loop
                        style={styles.menuIcon} />
                </TouchableOpacity>

                {isActionSheetOpen && (
                    <TouchableOpacity
                        style={[styles.mapCloseButton, { backgroundColor: Colors.Background(isDarkMode) }]}
                        onPress={handleActionSheetClose}
                    >
                        <Image
                            source={Images.ic_cross}
                            style={[styles.closeIcon, { tintColor: Colors.Text(isDarkMode) }]}
                        />
                    </TouchableOpacity>
                )}
            </View>
            <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: Colors.Background(isDarkMode) }}>
                {!isKeyboardVisible && !showLocationDetails && routeLocations.length > 0 && !isActionSheetOpen && (
                    <View style={[styles.buttonContainer, { backgroundColor: Colors.Background(isDarkMode), borderTopColor: Colors.Border(isDarkMode) }]}>
                        {/* {isRouteOptimized && session?.current_route_trip?.tripStatus !== 'completed' && (
                            <View style={styles.timeButtonContainer}>
                                <Text style={styles.durationText}>{Utils.formatDuration(session?.current_route_trip?.time || 0)}</Text>
                                <View style={styles.startTimeContainer}>
                                    <Image source={Images.ic_time} style={[styles.startTimeImage, { tintColor: Colors.TextSecondary(isDarkMode) }]} />
                                    <Text style={[styles.startTimeText, { color: Colors.TextSecondary(isDarkMode) }]}>
                                        {Utils.formatTime(session?.current_route_trip?.extraCricuitData?.startTime || new Date())}
                                    </Text>
                                </View>
                            </View>
                        )} */}

                        {session?.current_route_trip?.tripStatus === 'completed' ? (
                            <View style={styles.completedContainer}>
                                <Image source={Images.ic_check} style={styles.completedIcon} />
                                <Text style={styles.completedText}>Route has been completed</Text>
                            </View>
                        ) : (
                            <Button
                                style={styles.optimizeButton}
                                onPress={isRouteStarted ? handleEndRoute : isRouteOptimized ? handleStartRoute : handleOptimizeRoute}
                                disabled={isOptimizing}
                                title={isOptimizing
                                    ? 'Optimizing...'
                                    : isRouteStarted
                                        ? "Mark as completed"
                                        : isRouteOptimized ? "Start Route" : Strings.optimize_route}
                                buttonTitleStyle={styles.optimizeButtonText}
                                leftImage={isRouteOptimized ? Images.Start : Images.Layers}
                                leftImageStyle={{ tintColor: Colors.Defaultwhite }}
                                isLeftImageLottie={true}
                            />
                        )}

                    </View>
                )}
            </View>
            <BottomSheet
                ref={bottomSheetRef}
                index={isInitialized && isBottomSheetReady ? currentIndex : -1}
                snapPoints={snapPoints}
                onChange={handleSheetChanges}
                handleIndicatorStyle={styles.handleIndicator}
                enablePanDownToClose={false}
                enableOverDrag={false}
                enableContentPanningGesture={isInitialized}
                enableHandlePanningGesture={isInitialized}
                backgroundStyle={{ backgroundColor: Colors.Background(isDarkMode) }}
            >
                <BottomSheetView style={[styles.contentContainer, { backgroundColor: Colors.Background(isDarkMode) }]}>
                    <Circuit
                        currentIndex={currentIndex}
                        onExpand={expandSheet}
                        onFullExpand={fullExpandSheet}
                        onCollapse={collapseSheet}
                        session={session}
                        setSession={setSession}
                        navigation={navigation}
                        onActiveRouteLocationPress={handleActiveRouteLocationPress}
                        isOptimizing={isOptimizing}
                        showLocationDetails={showLocationDetails}
                        setShowLocationDetails={setShowLocationDetails}
                    />
                </BottomSheetView>
            </BottomSheet>

            <BottomSheet
                ref={locationActionSheetRef}
                index={isInitialized && isActionSheetReady ? 0 : -1}
                snapPoints={actionSheetSnapPoints}
                handleIndicatorStyle={styles.handleIndicator}
                onClose={handleActionSheetClose}
                enableOverDrag={false}
                enableContentPanningGesture={isInitialized}
                enableHandlePanningGesture={isInitialized}
                backgroundStyle={{ backgroundColor: Colors.Background(isDarkMode) }}
                enablePanDownToClose={true}
                animateOnMount={true}
            >
                <BottomSheetScrollView
                    style={[styles.locationSheetContainer, { backgroundColor: Colors.Background(isDarkMode) }]}
                >
                    <LocationActionSheet
                        location={selectedLocation}
                        locations={session?.current_route_trip?.locations || []}
                        onAction={handleLocationAction}
                        onClose={handleActionSheetClose}
                        onPageChange={handleLocationPageChange}
                        session={session}
                        setSession={setSession}
                        onEndRoute={handleEndRoute}
                        isRouteCompleted={session?.current_route_trip?.tripStatus === 'completed' || false}
                    />
                </BottomSheetScrollView>
            </BottomSheet>
        </View>
        // </KeyboardAvoidingView>
    )
}
const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.Defaultwhite,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    mapContainer: {
        width: '100%',
        height: '75%',
    },
    menuButton: {
        position: 'absolute',
        top: 16,
        left: 16,
        backgroundColor: Colors.Defaultwhite,
        padding: 6,
        borderRadius: 8,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    menuIcon: {
        width: 30,
        height: 30,
        tintColor: Colors.BlackColor700,
    },
    // Bottom sheet styles
    contentContainer: {
        flex: 1,
        padding: 16,
        alignItems: 'center',
        marginBottom: 80,
    },
    locationSheetContainer: {
        flex: 1,
    },
    handleIndicator: {
        backgroundColor: Colors.BlackColor500,
        width: 50,
    },
    bottomSheetBackground: {
        backgroundColor: Colors.Defaultwhite,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    titleText: {
        fontFamily: Fonts.name.bold,
        fontSize: Fonts.size._18px,
        color: Colors.Defaultblack,
        marginBottom: 20,
    },
    createRouteButton: {
        backgroundColor: Colors.Blue500,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
        width: '90%',
        alignItems: 'center',
    },
    buttonText: {
        fontFamily: Fonts.name.medium,
        fontSize: Fonts.size._14px,
        color: Colors.Defaultwhite,
    },
    mapCloseButton: {
        position: 'absolute',
        top: 10,
        right: 12,
        backgroundColor: Colors.Defaultwhite,
        borderRadius: 8,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        padding: 8,
    },
    closeIcon: {
        width: 25,
        height: 25,
        tintColor: Colors.BlackColor700,
    },
    // New styles from Circuit component
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'center', // Ensures vertical alignment
        justifyContent: 'flex-start', // Distributes items evenly
        borderTopColor: Colors.BlackColor200,
        backgroundColor: Colors.Defaultwhite,
        padding: 16,
        zIndex: 1000,
        width: '100%',
    },
    optimizeButton: {
        backgroundColor: Colors.Blue500,
        borderColor: Colors.Blue500,
        borderWidth: 1,
        borderRadius: 8,
        flex: 1, // Makes button responsive and take available space
        alignItems: 'center',
    },
    startRouteButton: {
        borderColor: Colors.Green500,
    },
    optimizeIcon: {
        width: 20,
        height: 20,
        tintColor: Colors.Green500,
        marginRight: 8,
    },
    optimizeButtonText: {
        fontSize: Fonts.size._16px,
        fontFamily: Fonts.name.medium,
        color: Colors.Defaultwhite,
    },
    timeButtonContainer: {
        // flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    durationText: {
        fontSize: Fonts.size._16px,
        fontFamily: Fonts.name.medium,
        color: Colors.Green500,
    },
    startTimeText: {
        fontSize: Fonts.size._14px,
        fontFamily: Fonts.name.medium,
        color: Colors.BlackColor900,
    },
    startTimeImage: {
        width: 20,
        height: 20,
        tintColor: Colors.BlackColor900,
        marginEnd: 4,
    },
    startTimeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
        marginEnd: 4
    },
    completedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.Green50,
        padding: 12,
        borderRadius: 8,
        flex: 1
    },
    completedIcon: {
        width: 20,
        height: 20,
        tintColor: Colors.Green500,
        marginRight: 8,
    },
    completedText: {
        fontSize: Fonts.size._16px,
        fontFamily: Fonts.name.medium,
        color: Colors.Green500,
    },
})

export default WarpperComponent(MainHome)