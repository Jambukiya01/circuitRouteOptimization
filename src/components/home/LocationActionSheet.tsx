import React, { useEffect, useState, useRef, memo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Dimensions, Alert } from 'react-native';
import { Colors, Fonts, Images, Utils } from '../../constants';
import { Place } from '../../model/LocationModel';
import PagerView from 'react-native-pager-view';
import MyIndicatorViewPager from '../common/MyIndicatorViewPager';
import { ScrollView } from 'react-native-gesture-handler';
import { ActionButton, ActionItem, StatusBanner, Button } from '../common';
import Strings from '../../language/Strings';
import { useTheme } from '../../context/ThemeContext';
const { height, width } = Dimensions.get('window');

interface LocationActionSheetProps {
    location: Place | null;
    locations: Place[];
    onAction: (action: string) => void;
    onClose: () => void;
    onPageChange?: (index: number, location: Place) => void;
    session?: any;
    setSession?: (key: string, value: any) => void;
    onEndRoute?: () => void;
    isRouteCompleted?: boolean;
}

const LocationActionSheet = memo(({
    location,
    locations,
    onAction,
    onClose,
    onPageChange,
    session,
    setSession,
    onEndRoute,
    isRouteCompleted
}: LocationActionSheetProps) => {

    if (!location) return null;

    const { theme, setTheme, isDarkMode } = useTheme();

    // Use useRef instead of createRef for better lifecycle management
    const pagerViewRef = useRef<PagerView>(null);
    const [currentLocation, setCurrentLocation] = useState<Place>(location);
    const [currentIndex, setCurrentIndex] = useState<number>(0);

    // Find index of the selected location in the locations array
    const initialPage = locations?.findIndex(
        (loc) => loc.uniqueId === location.uniqueId
    );

    useEffect(() => {
        // Set the initial index
        if (initialPage >= 0) {
            setCurrentIndex(initialPage);
        }
    }, [initialPage]);

    // Modify your handleAction function to accept the action directly
    const executeAction = (action: string) => {
        console.log('handleAction', action);
        onAction(action);

        // After action is performed, move to next location if available
        if (currentIndex < validLocations?.length - 1) {
            setTimeout(() => {
                const newIndex = currentIndex + 1;
                pagerViewRef.current?.setPage(newIndex);
            }, 100);
        }
    };

    const handleCancel = () => {
        onClose();
    };

    // Handle undoing a status (delivered or failed)
    const handleUndo = (locationId: string) => {
        // Call onAction with 'undo' action and pass the location ID
        onAction('undo_status');
    };

    const handlePageChange = (event: any) => {
        const newIndex = event.position;
        if (locations[newIndex]) {
            setCurrentLocation(locations[newIndex]);
            setCurrentIndex(newIndex);

            // Notify parent component about page change
            if (onPageChange) {
                onPageChange(newIndex, locations[newIndex]);
            }

            // Update selected location in session for map focus
            if (setSession) {
                setSession('selectedLocation', locations[newIndex]);
            }
        }
    };

    // Navigation handlers
    const goToPrevious = () => {
        if (currentIndex > 0) {
            const newIndex = currentIndex - 1;
            pagerViewRef.current?.setPage(newIndex);
        }
    };

    const goToNext = () => {
        if (currentIndex < validLocations?.length - 1) {
            const newIndex = currentIndex + 1;
            pagerViewRef.current?.setPage(newIndex);
        }
    };

    // Filter out any undefined locations to prevent rendering issues
    const validLocations = locations?.filter(loc => loc !== undefined);

    // Check current location status
    const showSuccessUI = currentLocation.status === 'delivered';
    const showFailedUI = currentLocation.status === 'failed';

    // Determine if navigation buttons should be disabled
    const isFirstLocation = currentIndex === 0;
    const isLastLocation = currentIndex === validLocations?.length - 1;

    return (
        <View style={{ flex: 1, height: height * 0.65 }}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Navigation Indicator */}
                <View style={[styles.navigationIndicator, { borderBottomColor: Colors.Border(isDarkMode) }]}>
                    <TouchableOpacity
                        style={[styles.navButton, { backgroundColor: isFirstLocation ? Colors.Background(isDarkMode) : Colors.BackgroundSecondary(isDarkMode) }]}
                        onPress={goToPrevious}
                        disabled={isFirstLocation}
                    >
                        <Image
                            source={Images.ic_arrow_left}
                            style={[styles.navIcon, { tintColor: isFirstLocation ? Colors.TextSecondary(isDarkMode) : Colors.Text(isDarkMode) }]}
                        />
                    </TouchableOpacity>

                    <Text style={[styles.pageIndicator, { color: Colors.Text(isDarkMode) }]}>
                        {validLocations?.length > 0 ? `${currentIndex + 1} of ${validLocations?.length}` : '0 of 0'}
                    </Text>

                    <TouchableOpacity
                        style={[styles.navButton, { backgroundColor: isLastLocation ? Colors.Background(isDarkMode) : Colors.BackgroundSecondary(isDarkMode) }]}
                        onPress={goToNext}
                        disabled={isLastLocation}
                    >
                        <Image
                            source={Images.ic_arrow_right}
                            style={[styles.navIcon, { tintColor: isLastLocation ? Colors.TextSecondary(isDarkMode) : Colors.Text(isDarkMode) }]}
                        />
                    </TouchableOpacity>
                </View>

                <MyIndicatorViewPager
                    enableScroll={true}
                    forwardedRefrence={pagerViewRef}
                    initialPage={initialPage >= 0 ? initialPage : 0}
                    containerStyle={{ flex: 1 }}
                    animationEnabled={true}
                    onPageSelected={(event) => {
                        handlePageChange(event);
                    }}>
                    {validLocations?.map((loc: Place, index: number) => {
                        // Generate a unique key for each location
                        const pageKey = loc.uniqueId || `location-${index}`;

                        // Check location status for this specific page
                        const isCurrentLocation = loc.uniqueId === currentLocation.uniqueId;
                        const pageShowSuccessUI = loc.status === 'delivered' || loc.status === 'pickuped' || isRouteCompleted;
                        const pageShowFailedUI = loc.status === 'failed';

                        return (
                            <View style={[styles.container, { backgroundColor: Colors.Background(isDarkMode) }]} key={pageKey}>
                                {/* Header Section */}
                                <View style={styles.header}>
                                    <View style={styles.headerContent}>
                                        <Text style={[styles.title, { color: Colors.Text(isDarkMode) }]}>{loc.title}</Text>
                                        <Text style={[styles.subtitle, { color: Colors.TextSecondary(isDarkMode) }]}>{loc.subtitle}</Text>
                                    </View>

                                    {/* Status Indicator - Only shown when there's a status */}
                                    {pageShowSuccessUI && (
                                        <StatusBanner
                                            icon={Images.ic_check}
                                            iconColor={Colors.Green500}
                                            text={loc.stopType === 'delivery' ? "Marked as delivered" : "Marked as pickuped"}
                                            textColor={Colors.Green500}
                                            onUndo={() => handleUndo(loc.uniqueId || '')}
                                        />
                                    )}

                                    {pageShowFailedUI && (
                                        <StatusBanner
                                            icon={Images.ic_cross}
                                            iconColor={"#e57f7a"}
                                            text="Marked as failed"
                                            textColor={"#e57f7a"}
                                            onUndo={() => handleUndo(loc.uniqueId || '')}
                                        />
                                    )}

                                    {/* Timestamp - Only shown when there's a status */}
                                    {(pageShowSuccessUI || pageShowFailedUI) && loc.statusUpdateTime && (
                                        <Text style={[styles.timeText, { color: Colors.TextSecondary(isDarkMode) }]}>
                                            {new Date(loc.statusUpdateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    )}
                                </View>

                                {/* Action Buttons - Only shown when there's no status - HORIZONTAL ROW */}
                                {!pageShowSuccessUI && !pageShowFailedUI && (
                                    <View style={styles.actionButtonsContainer}>
                                        <View style={styles.actionButtonsRow}>
                                            <ActionButton
                                                icon={Images.ic_navigation}
                                                label="Navigate"
                                                onPress={() => executeAction('navigate')}
                                                backgroundColor={Colors.Blue500}
                                                labelColor={Colors.Defaultwhite}
                                            />
                                            {/* <ActionButton
                                            icon={Images.ic_make_next}
                                            label="Make next"
                                            onPress={() => executeAction('make_next')}
                                        /> */}
                                            <ActionButton
                                                icon={Images.ic_failed}
                                                label="Failed"
                                                onPress={() => {
                                                    executeAction('failed');
                                                    goToNext();
                                                }}
                                                backgroundColor={Colors.BackgroundSecondary(isDarkMode)}
                                                labelColor={Colors.Text(isDarkMode)}
                                            />
                                            <ActionButton
                                                icon={Images.ic_delivered}
                                                label={loc.stopType === 'delivery' ? 'Delivered' : 'Pickup'}
                                                onPress={() => {
                                                    executeAction(loc.stopType === 'delivery' ? 'delivered' : 'pickuped');
                                                    goToNext();
                                                }}
                                                backgroundColor={Colors.BackgroundSecondary(isDarkMode)}
                                                labelColor={Colors.Text(isDarkMode)}
                                            />
                                        </View>
                                    </View>
                                )}
                                {/* Common Actions Section */}
                                <View style={styles.actionsContainer}>
                                    {loc?.locationNotes &&
                                        <ActionItem
                                            iconSource={Images.ic_notes}
                                            label={loc?.locationNotes}
                                            onPress={() => { }}
                                        />
                                    }
                                    {loc?.orderType &&
                                        <ActionItem
                                            iconSource={Images.ic_type}
                                            label={loc?.orderType}
                                            onPress={() => { }}
                                        />
                                    }
                                    {loc?.arrivalTime &&
                                        <ActionItem
                                            iconSource={Images.Delivery_Time}
                                            label={Utils.formatTime(loc?.arrivalTime?.from || "") + " - " + Utils.formatTime(loc?.arrivalTime?.to || "")}
                                            onPress={() => { }}
                                            lottieIcon={true}
                                        />
                                    }
                                    {loc?.timeAtStop &&
                                        <ActionItem
                                            iconSource={Images.Stop_Watch}
                                            label={`${loc?.timeAtStop?.minutes ?? 0} min ${loc?.timeAtStop?.seconds ?? 0} sec`}
                                            onPress={() => { }}
                                            lottieIcon={true}
                                        />
                                    }
                                    {loc?.packageCount &&
                                        <ActionItem
                                            iconSource={Images.logistic_packages}
                                            label={loc?.packageCount + " Packages"}
                                            onPress={() => { }}
                                            lottieIcon={true}
                                        />
                                    }
                                    {loc?.packageFinder?.size &&
                                        <ActionItem
                                            iconSource={Images.IC_Package}
                                            label={loc?.packageFinder?.size}
                                            onPress={() => { }}
                                            lottieIcon={true}
                                        />
                                    }
                                    {loc?.packageFinder?.type &&
                                        <ActionItem
                                            iconSource={Images.IC_Package}
                                            label={loc?.packageFinder?.type}
                                            onPress={() => { }}
                                            lottieIcon={true}
                                        />
                                    }
                                    {loc?.packageFinder?.position &&
                                        <ActionItem
                                            iconSource={Images.IC_Package}
                                            label={`${loc?.packageFinder?.position?.heightPosition || ""} ${loc?.packageFinder?.position?.horizontal || ""} ${loc?.packageFinder?.position?.leftRight || ""}`}
                                            onPress={() => { }}
                                            lottieIcon={true}
                                        />
                                    }
                                    {/* <ActionItem
                                        iconSource={Images.ic_delete}
                                        label="Remove stop"
                                        labelColor={Colors.Red500}
                                        onPress={() => { }}
                                    /> */}
                                </View>
                            </View>
                        );
                    })}
                </MyIndicatorViewPager>

                {/* Add the button container at the bottom */}
                <View style={[styles.buttonContainer, { backgroundColor: Colors.Background(isDarkMode), borderTopColor: Colors.Border(isDarkMode) }]}>
                    {session?.current_route_trip?.tripStatus === 'completed' ? (
                        <View style={styles.completedContainer}>
                            <Image source={Images.ic_check} style={styles.completedIcon} />
                            <Text style={styles.completedText}>Route has been completed</Text>
                        </View>
                    ) : (
                        <View style={{ flex: 1 }}>
                            <Button
                                style={styles.optimizeButton}
                                onPress={() => { onClose(), onEndRoute?.() }}
                                title={"Route all locations as completed"}
                                buttonTitleStyle={styles.optimizeButtonText}
                                leftImage={Images.Start}
                                leftImageStyle={{ tintColor: Colors.Defaultwhite }}
                                isLeftImageLottie={true}
                            />
                        </View>
                    )}
                </View>
            </ScrollView>
        </View >
    );
});

// Reusable Status Banner component

const styles = StyleSheet.create({
    actionButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        width: '100%',
    },
    actionButtonsContainer: {
        // marginVertical: 16,
        paddingHorizontal: 4,
    },
    container: {
        height: "100%",
        width: "100%",
        backgroundColor: Colors.Defaultwhite,
        padding: 16,
        paddingTop: 8
    },
    navigationIndicator: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: Colors.BlackColor200,
    },
    navButton: {
        padding: 8,
        backgroundColor: Colors.BlackColor100,
        borderRadius: 8,
    },
    navButtonDisabled: {
        backgroundColor: Colors.BlackColor50,
    },
    navIcon: {
        width: 20,
        height: 20,
        tintColor: Colors.BlackColor700,
    },
    navIconDisabled: {
        tintColor: Colors.BlackColor400,
    },
    pageIndicator: {
        fontFamily: Fonts.name.medium,
        fontSize: Fonts.size._14px,
        color: Colors.BlackColor700,
    },
    header: {
        marginBottom: 16
    },
    headerContent: {
        marginBottom: 4,
    },
    title: {
        fontSize: Fonts.size._18px,
        fontFamily: Fonts.name.bold,
        color: Colors.Defaultblack,
        marginBottom: 4
    },
    subtitle: {
        fontSize: Fonts.size._14px,
        fontFamily: Fonts.name.medium,
        color: Colors.BlackColor600,
        marginBottom: 8
    },
    // Status banner styles
    timeText: {
        fontSize: Fonts.size._12px,
        fontFamily: Fonts.name.medium,
        color: Colors.BlackColor500,
        marginTop: 4
    },
    // Action buttons row - horizontal layout
    // Action list styles
    actionsContainer: {
        marginTop: 12
    },
    headerNavigation: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 8,
        paddingVertical: 4,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: Colors.BlackColor100,
    },
    headerNavButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 6,
    },
    headerNavIcon: {
        width: 16,
        height: 16,
        tintColor: Colors.Blue500,
    },
    headerNavText: {
        fontSize: Fonts.size._14px,
        fontFamily: Fonts.name.medium,
        color: Colors.Blue500,
        marginHorizontal: 4,
    },
    headerNavTextDisabled: {
        color: Colors.BlackColor400,
    },
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        padding: 16,
        borderTopColor: Colors.BlackColor200,
        backgroundColor: Colors.Defaultwhite,
        borderTopWidth: 1,
    },
    timeButtonContainer: {
        marginEnd: 16,
        height: "auto",
        width: 70,
        justifyContent: "center"
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
    },
    optimizeButton: {
        backgroundColor: Colors.Blue500,
        borderColor: Colors.Blue500,
        borderWidth: 1,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
    },
    optimizeButtonText: {
        fontSize: Fonts.size._16px,
        fontFamily: Fonts.name.medium,
        color: Colors.Defaultwhite,
    },
    completedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.Green50,
        padding: 12,
        borderRadius: 8,
        flex: 1,
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
});

export default LocationActionSheet; 