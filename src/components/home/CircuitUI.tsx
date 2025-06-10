import BottomSheet from '@gorhom/bottom-sheet';
import React, { useRef } from 'react'
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Image,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    Modal,
    Alert
} from 'react-native';
import { Colors, Fonts, hp, Images, Utils, wp } from '../../constants';
import Strings from '../../language/Strings';
import SearchLocation from './SearchLocation';
import LocationDetailsCard from './LocationDetailsCard';
import ActiveRouteUI from './ActiveRouteUI';
import { Place } from '../../model/LocationModel';
import { ScrollView } from 'react-native-gesture-handler'
import LottieView from 'lottie-react-native'
import AddressListView from './AddressListView';
import { MenuComponentRef, MenuView } from '@react-native-menu/menu';
import ContextMenu from '../common/ContextMenu';
import { useTheme } from '../../context/ThemeContext';




interface CircuitUIProps {
    currentIndex?: number;
    onExpand?: () => void;
    onCollapse?: () => void;
    onFullExpand?: () => void;
    session?: any;
    setSession?: (key: string, value: any) => void;
    navigation?: any;
    onSearchChange?: (text: string) => void;
    searchText?: string;
    placeData?: any[];
    onPlaceSelect?: (place: any) => void;
    routeLocations?: {
        id?: number;
        title?: string;
        subtitle?: string;
        placeId?: string;
        latitude?: number;
        longitude?: number;
        packageCount?: number;
        orderType?: 'first' | 'auto' | 'last';
        stopType?: 'delivery' | 'pickup';
        uniqueId?: string;
    }[];
    selectedLocation?: {
        id?: number;
        title?: string;
        subtitle?: string;
        placeId?: string;
        latitude?: number;
        longitude?: number;
        packageCount?: number;
        orderType?: 'first' | 'auto' | 'last';
        stopType?: 'delivery' | 'pickup';
        uniqueId?: string;
    } | null;
    showLocationDetails?: boolean;
    onLocationClick?: (location: Place) => void;
    onCloseLocationDetails?: () => void;
    onChangeAddress?: () => void;
    onDuplicateStop?: () => void;
    onRemoveStop?: () => void;
    onRouteDetails: (fromBreak: boolean) => void;
    extraCricuitData?: any;
    onChangeRouteName: (newName: string) => void;
    routeName?: string;
    isOptimizing?: boolean;
    isRouteOptimized?: boolean;
    totalDistance?: number;
    totalTime?: number;
    isRouteStarted: boolean;
    onMarkAsCompleted: (location: Place) => void;
    onEndRoute: () => void;
    onActiveRouteLocationPress: (uniqueId: string) => void;
    onPinOnMap: () => void;
    handleSessionUpdate: (key: string, value: any) => void;
    isRouteCompleted: boolean;
}

const menuActions = [
    {
        id: '1',
        title: 'Share Route copy',
        titleColor: Colors.TextColor,
    },
    {
        id: '2',
        title: 'Copy stops...',
        titleColor: Colors.TextColor,
    },
    {
        id: '3',
        title: 'Reoptimize route...',
        titleColor: Colors.TextColor,
    },
    {
        id: '4',
        title: 'Import spreadsheet',
        titleColor: Colors.TextColor,
    },
    {
        id: '5',
        title: 'Print route',
        titleColor: Colors.TextColor,
    },
    {
        id: '6',
        title: 'Remove stops',
        titleColor: Colors.TextColor,
    },
]

// Sample location data for demonstration
const defaultLocations = [
    {
        id: 1,
        title: 'Iscon Cross Road, Iskcon Cross Road',
        subtitle: 'Ramdev Nagar, 380015',
        placeId: 'place1',
        latitude: 0,
        longitude: 0,
        uniqueId: 'default_location_1'
    },
    {
        id: 2,
        title: 'GMDC Ground, Vastrapur, Ahmedabad',
        subtitle: '380052',
        placeId: 'place2',
        latitude: 0,
        longitude: 0,
        uniqueId: 'default_location_2'
    }
];

const CircuitUI: React.FC<CircuitUIProps> = ({
    currentIndex,
    onExpand,
    onCollapse,
    onFullExpand,
    session,
    setSession,
    navigation,
    onSearchChange,
    searchText,
    placeData,
    onPlaceSelect,
    routeLocations = defaultLocations,
    selectedLocation,
    showLocationDetails,
    onLocationClick,
    onCloseLocationDetails,
    onChangeAddress,
    onDuplicateStop,
    onRemoveStop,
    onRouteDetails,
    extraCricuitData,
    onChangeRouteName,
    routeName,
    isOptimizing,
    isRouteOptimized,
    totalDistance,
    totalTime,
    isRouteStarted,
    onMarkAsCompleted,
    onEndRoute,
    onActiveRouteLocationPress,
    onPinOnMap,
    handleSessionUpdate,
    isRouteCompleted
}) => {
    const menuRef = useRef<MenuComponentRef>(null);
    const { theme, setTheme, isDarkMode } = useTheme();
    const [isKeyboardVisible, setKeyboardVisible] = React.useState(false);
    const [showRouteNameModal, setShowRouteNameModal] = React.useState(false);
    const [tempRouteName, setTempRouteName] = React.useState(routeName || Strings.my_first_route);
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [isSearchFocused, setIsSearchFocused] = React.useState(false);

    const handleSearchChange = (text: string) => {
        setIsSearchFocused(true);
        onSearchChange?.(text);
    };

    React.useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                setKeyboardVisible(true);
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setIsSearchFocused(false);
                setKeyboardVisible(false);
            }
        );

        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, []);

    React.useEffect(() => {
        setTempRouteName(routeName || Strings.my_first_route);
    }, [routeName]);

    const handleRouteNameChange = (text: string) => {
        setTempRouteName(text);
    };

    const openRouteNameModal = () => {
        setTempRouteName(routeName || Strings.my_first_route);
        setShowRouteNameModal(true);
    };

    const handleSaveRouteName = () => {
        if (tempRouteName.trim()) {
            onChangeRouteName(tempRouteName.trim());
        } else {
            setTempRouteName(routeName || Strings.my_first_route);
        }
        setShowRouteNameModal(false);
    };

    const handleCancelRouteNameEdit = () => {
        setTempRouteName(routeName || Strings.my_first_route);
        setShowRouteNameModal(false);
    };
    const handleSearchLocationFocus = () => {
        setIsSearchFocused(true);
    }

    const renderRouteHeader = () => {
        return (
            <View style={styles.routeHeaderContainer}>
                <View style={styles.routeHeaderTopRow}>
                    <View style={styles.routeHeaderLeftContent}>
                        <Text style={[styles.stopsCount, { color: Colors.Text(isDarkMode) }]}>{routeLocations.length} {Strings.stops_count}</Text>
                        {isRouteOptimized && (
                            <Text style={[styles.stopsCount, { color: Colors.Text(isDarkMode) }]}>{Utils.formatDuration(session?.current_route_trip?.time || 0)} - {Utils.getDistance(totalDistance || 0, session?.preferences?.distanceUnit || 'Kilometers')}</Text>
                        )}
                    </View>
                    {isRouteOptimized && (
                        <View style={styles.routeHeaderRightContent}>
                            <Text style={[styles.routeInfoText, { color: Colors.Text(isDarkMode) }]}>
                                {`Start ${Utils.formatTime(Utils.getStartTime() || new Date())}`}
                            </Text>
                            <Text style={[styles.routeInfoText, { color: Colors.Text(isDarkMode) }]}>
                                {`Finish ${Utils.formatTime(Utils.getEndTime() || new Date())}`}
                            </Text>
                        </View>
                    )}
                </View>
                <TouchableOpacity onPress={openRouteNameModal}>
                    <Text style={[styles.routeTitle, { color: Colors.Text(isDarkMode) }]}>{routeName || Strings.my_first_route}</Text>
                </TouchableOpacity>
                <View style={[styles.separator, { backgroundColor: Colors.Border(isDarkMode) }]} />
            </View>
        );
    };
    const extraLabels = (text: string) => {
        return (
            <View style={styles.extraLabelsContainer}>
                <Text style={styles.labelText}>{text}</Text>
            </View>
        )
    }

    const renderContent = () => {
        if (isKeyboardVisible && isSearchFocused) {
            return (
                <SearchLocation
                    placeData={placeData}
                    onPlaceSelect={(place) => {
                        onPlaceSelect?.(place);
                    }}
                />
            );
        }

        if (showLocationDetails && selectedLocation) {
            return (
                <LocationDetailsCard
                    location={selectedLocation}
                    onClose={onCloseLocationDetails}
                    onChangeAddress={onChangeAddress}
                    onDuplicateStop={onDuplicateStop}
                    onRemoveStop={onRemoveStop}
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
                />
            );
        }
        if (isRouteStarted || isRouteCompleted) {
            return (
                <ActiveRouteUI
                    routeTrip={session?.current_route_trip}
                    onMarkAsCompleted={onMarkAsCompleted}
                    onEndRoute={onEndRoute}
                    openRouteNameModal={openRouteNameModal}
                    onRouteDetails={onRouteDetails}
                    onActiveRouteLocationPress={onActiveRouteLocationPress}
                    isRouteCompleted={isRouteCompleted}
                />
            )
        }

        return (
            <ScrollView>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={[styles.container, { backgroundColor: Colors.Background(isDarkMode) }]}>
                    {routeLocations.length > 0 ?
                        <View style={styles.contentContainer}>
                            {/* Route header */}
                            {renderRouteHeader()}

                            {/* Route options */}
                            <View style={styles.routeOptionsContainer}>
                                {/* Start from current location */}
                                <TouchableOpacity style={[styles.optionItem, { borderBottomColor: Colors.Border(isDarkMode) }]} onPress={() => onRouteDetails?.(false)}>
                                    <View style={styles.optionLeftContent}>
                                        <LottieView source={Images.Gps}
                                            autoPlay
                                            loop
                                            style={styles.optionIcon} />
                                        {/* <Image source={Images.ic_home} style={styles.optionIcon} /> */}
                                        <View style={styles.optionTextContainer}>
                                            <Text style={[styles.optionTitle, { color: Colors.Text(isDarkMode) }]}>{extraCricuitData?.startLocation?.title || Strings.start_from_current}</Text>
                                            <Text style={[styles.optionSubtitle, { color: Colors.TextSecondary(isDarkMode) }]}>{extraCricuitData?.startLocation?.subtitle || Strings.use_gps_position}</Text>
                                        </View>
                                    </View>
                                    <Image source={Images.ic_chevron_right} style={[styles.chevronIcon, { tintColor: Colors.TextSecondary(isDarkMode) }]} />
                                </TouchableOpacity>

                                {/* Round trip */}
                                <TouchableOpacity style={[styles.optionItem, { borderBottomColor: Colors.Border(isDarkMode) }]} onPress={() => onRouteDetails?.(false)}>
                                    <View style={styles.optionLeftContent}>
                                        {/* <Image source={
                                        extraCricuitData?.endLocation?.id === 1 ? Images.ic_round_trip :
                                            extraCricuitData?.endLocation?.id === 2 ? Images.ic_location :
                                                extraCricuitData?.endLocation?.id === 3 ? Images.ic_close :
                                                    Images.ic_round_trip
                                    } style={styles.optionIcon} /> */}
                                        <LottieView source={Images.Gps}
                                            autoPlay
                                            loop
                                            style={styles.optionIcon} />
                                        <View style={styles.optionTextContainer}>
                                            <Text style={[styles.optionTitle, { color: Colors.Text(isDarkMode) }]}>{extraCricuitData?.endLocation?.title || Strings.round_trip}</Text>
                                            <Text style={[styles.optionSubtitle, { color: Colors.TextSecondary(isDarkMode) }]}>{extraCricuitData?.endLocation?.subtitle || Strings.return_to_start}</Text>
                                        </View>
                                    </View>
                                    <Image source={Images.ic_chevron_right} style={[styles.chevronIcon, { tintColor: Colors.TextSecondary(isDarkMode) }]} />
                                </TouchableOpacity>

                                {/* No break */}
                                <TouchableOpacity style={[styles.optionItem, { borderBottomColor: Colors.Border(isDarkMode) }]} onPress={() => onRouteDetails?.(true)}>
                                    <View style={styles.optionLeftContent}>
                                        {/* <Image source={Images.ic_break} style={styles.optionIcon} /> */}
                                        <LottieView source={Images.Break_Time}
                                            autoPlay
                                            loop
                                            style={styles.optionIcon} />
                                        <View style={styles.optionTextContainer}>
                                            {extraCricuitData?.breakSetup?.duration ?
                                                <Text style={[styles.optionTitle, { color: Colors.Text(isDarkMode) }]}>{extraCricuitData?.breakSetup?.duration + " break" || Strings.no_break}</Text> :
                                                <Text style={[styles.optionTitle, { color: Colors.Text(isDarkMode) }]}>{Strings.no_break}</Text>
                                            }
                                            {extraCricuitData?.breakSetup?.startTime && extraCricuitData?.breakSetup?.endTime ?
                                                <Text style={[styles.optionSubtitle, { color: Colors.TextSecondary(isDarkMode) }]}>{"Between " + Utils.formatTime(extraCricuitData?.breakSetup?.startTime) + " - " + Utils.formatTime(extraCricuitData?.breakSetup?.endTime) || Strings.tap_to_plan_break}</Text> :
                                                <Text style={[styles.optionSubtitle, { color: Colors.TextSecondary(isDarkMode) }]}>{Strings.tap_to_plan_break}</Text>
                                            }
                                        </View>
                                    </View>
                                    <Image source={Images.ic_chevron_right} style={[styles.chevronIcon, { tintColor: Colors.TextSecondary(isDarkMode) }]} />
                                </TouchableOpacity>

                                {/* Route line container */}
                                {isRouteOptimized && (
                                    <View style={styles.routeOptionsGroup}>
                                        <AddressListView
                                            // startLocation={extraCricuitData?.startLocation}
                                            endLocation={extraCricuitData?.endLocation}
                                            locations={routeLocations}
                                            onLocationPress={onLocationClick}
                                        />
                                    </View>
                                )}

                                {!isRouteOptimized && (
                                    /* Regular location stops when not optimized */
                                    routeLocations.map((location, index) => (
                                        <TouchableOpacity
                                            key={location.uniqueId || `location_${location.placeId}_${index}`}
                                            style={[styles.locationItem, { borderBottomColor: Colors.Border(isDarkMode) }]}
                                            onPress={() => onLocationClick?.(location)}
                                        >
                                            <View style={styles.optionLeftContent}>
                                                <View style={styles.locationDot} />
                                                <View style={styles.optionTextContainer}>
                                                    <Text style={[styles.optionTitle, { color: Colors.Text(isDarkMode) }]}>{location.title}</Text>
                                                    <Text style={[styles.optionSubtitle, { color: Colors.TextSecondary(isDarkMode) }]}>{location.subtitle}</Text>
                                                </View>
                                            </View>
                                            <Image source={Images.ic_chevron_right} style={[styles.chevronIcon, { tintColor: Colors.TextSecondary(isDarkMode) }]} />
                                        </TouchableOpacity>
                                    ))
                                )}
                            </View>
                        </View>
                        :
                        <View style={styles.emptyStateContainer}>
                            {/* <Image source={Images.ic_empty_route} style={styles.emptyStateIcon} /> */}
                            <LottieView source={Images.Add_Location}
                                autoPlay
                                loop
                                style={styles.emptyStateIcon} />
                            <Text style={[styles.emptyStateText, { color: Colors.Text(isDarkMode) }]}>Add new stops or find stops in{'\n'}your route</Text>
                        </View>}
                </TouchableWithoutFeedback>
            </ScrollView>
        );
    };

    return (
        // <ScrollView style={styles.container}>
        <View style={[styles.container, { backgroundColor: Colors.Background(isDarkMode) }]}>
            {/* Header search bar */}
            <View style={[styles.header, { borderBottomColor: Colors.Border(isDarkMode) }]}>
                {/* {currentIndex !== 3 && <TouchableOpacity style={styles.menuButton} onPress={() => navigation.openDrawer()}>
                        <Image
                            source={Images.ic_drawer_menu}
                            style={styles.menuIcon}
                        />
                    </TouchableOpacity>} */}
                <View style={styles.searchContainer}>
                    <View style={[styles.searchInputContainer, { backgroundColor: Colors.BackgroundSecondary(isDarkMode), borderColor: Colors.Border(isDarkMode) }]}>
                        <LottieView source={Images.Search}
                            autoPlay
                            loop
                            style={styles.searchIcon} />
                        {/* <Image
                                source={Images.ic_search}
                                style={styles.searchIcon}
                            /> */}
                        <TouchableWithoutFeedback onPress={handleSearchLocationFocus}>
                            <TextInput
                                autoFocus
                                style={[styles.searchInput, { color: Colors.Text(isDarkMode) }]}
                                placeholder={Strings.add_more_stops}
                                placeholderTextColor={Colors.BlackColor500}
                                onFocus={handleSearchLocationFocus}
                                value={searchText}
                                onChangeText={handleSearchChange}
                                onMagicTap={() => {
                                    console.log('onMagicTap');
                                }}
                            />
                        </TouchableWithoutFeedback>
                        <View style={styles.iconContainer}>
                            <TouchableOpacity style={styles.locationsButton} onPress={onPinOnMap}>
                                <Image
                                    source={Images.ic_pin_location}
                                    style={styles.pinIcon}
                                />
                            </TouchableOpacity>
                            {/* <TouchableOpacity style={styles.micButton}>
                                <Image
                                    source={Images.ic_mic}
                                    style={styles.micIcon}
                                />
                            </TouchableOpacity> */}
                        </View>
                    </View>
                    <ContextMenu
                        moreOptionsIconStyle={[{ tintColor: Colors.Text(isDarkMode) }]}
                        actions={menuActions}
                        onPressAction={(nativeEvent) => { console.log('pressed', nativeEvent) }}
                    />
                </View>
            </View>

            {/* Location details or route content */}
            {renderContent()}

            {/* Route name edit modal */}
            <Modal
                visible={showRouteNameModal}
                transparent={true}
                animationType="fade"
                onRequestClose={handleCancelRouteNameEdit}
            >
                <TouchableWithoutFeedback onPress={handleCancelRouteNameEdit}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
                            <View style={[styles.modalContent, { backgroundColor: Colors.Background(isDarkMode) }]}>
                                <Text style={[styles.modalTitle, { color: Colors.Text(isDarkMode) }]}>Route Name</Text>
                                <TextInput
                                    style={[styles.modalInput, { color: Colors.Text(isDarkMode), borderColor: Colors.Border(isDarkMode) }]}
                                    value={tempRouteName}
                                    onChangeText={handleRouteNameChange}
                                    autoFocus
                                    selectTextOnFocus
                                />
                                <View style={styles.modalButtonContainer}>
                                    <TouchableOpacity
                                        style={styles.modalButton}
                                        onPress={handleCancelRouteNameEdit}
                                    >
                                        <Text style={styles.modalButtonTextCancel}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.modalButtonPrimary]}
                                        onPress={handleSaveRouteName}
                                    >
                                        <Text style={styles.modalButtonTextSave}>Save</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

        </View>
        // </ScrollView >
    )
}

const styles = StyleSheet.create({
    keyboardAvoidingContainer: {
        flex: 1,
        width: '100%',
    },
    container: {
        width: '100%',
        height: '100%',
        backgroundColor: Colors.Defaultwhite,
    },
    header: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: Colors.BlackColor200,
    },
    menuButton: {
        marginRight: 12,
    },
    menuIcon: {
        width: 24,
        height: 24,
        tintColor: Colors.BlackColor700,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.BlackColor100,
        borderRadius: 30,
        paddingHorizontal: 12,
        paddingVertical: 8,
        flex: 1,
        marginRight: 10,
        borderWidth: 1,
        borderColor: Colors.Defaultblack,
    },
    searchIcon: {
        width: 25,
        height: 25,
        tintColor: Colors.BlackColor500,
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: Fonts.size._14px,
        fontFamily: Fonts.name.regular,
        color: Colors.Defaultblack,
        paddingVertical: 0,
        height: 30,
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationsButton: {
        marginHorizontal: 4,
    },
    pinIcon: {
        tintColor: Colors.BlackColor500,
        width: 20,
        height: 20,
    },
    micButton: {
        marginLeft: 8,
    },
    micIcon: {
        tintColor: Colors.BlackColor500,
        width: 20,
        height: 20,
    },
    moreOptionsButton: {
        padding: 6,
        backgroundColor: Colors.BlackColor100,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        width: 40,
        height: 40,
    },
    moreOptionsIcon: {
        tintColor: Colors.BlackColor500,
        width: 20,
        height: 20,
    },
    contentContainer: {
        flex: 1,
    },
    routeHeaderContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    routeHeaderTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    routeInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    routeInfoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 16,
    },
    routeInfoIcon: {
        width: 16,
        height: 16,
        tintColor: Colors.Blue500,
        marginRight: 4,
    },
    routeInfoText: {
        fontSize: Fonts.size._12px,
        fontFamily: Fonts.name.medium,
        color: Colors.BlackColor700,
        marginBottom: 4,
    },
    stopsCount: {
        fontSize: Fonts.size._12px,
        fontFamily: Fonts.name.regular,
        color: Colors.BlackColor600,
        marginBottom: 4,
    },
    routeTitle: {
        fontSize: Fonts.size._20px,
        fontFamily: Fonts.name.bold,
        color: Colors.Defaultblack,
        marginBottom: 12,
    },
    separator: {
        height: 1,
        backgroundColor: Colors.BlackColor200,
        width: '100%',
    },
    routeOptionsContainer: {
        paddingHorizontal: 16,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.BlackColor200,
    },
    locationItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.BlackColor200,
        zIndex: 2,
    },
    locationItemSpecial: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: Colors.BlackColor200,
        backgroundColor: Colors.BlackColor100,
        paddingHorizontal: 8,
        zIndex: 2,
    },
    optionLeftContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flex: 1,
    },
    optionIcon: {
        width: 30,
        height: 30,
        marginRight: 16,
        tintColor: Colors.Blue500,
    },
    locationDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.Blue500,
        marginRight: 16,
        marginLeft: 8,
        marginTop: 6,
    },
    optionTextContainer: {
        flex: 1,
    },
    optionTitle: {
        fontSize: Fonts.size._14px,
        fontFamily: Fonts.name.medium,
        color: Colors.Defaultblack,
        marginBottom: 4,
    },
    optionSubtitle: {
        fontSize: Fonts.size._12px,
        fontFamily: Fonts.name.regular,
        color: Colors.BlackColor600,
    },
    chevronIcon: {
        width: 16,
        height: 16,
        tintColor: Colors.BlackColor500,
    },
    buttonContainer: {
        height: 100,
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: Colors.BlackColor200,
    },
    optimizeButton: {
        backgroundColor: Colors.Defaultwhite,
        borderColor: Colors.Blue500,
        borderWidth: 1,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
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
    suggestionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginTop: 'auto',
        backgroundColor: Colors.BlackColor100,
    },
    suggestionIcon: {
        width: 16,
        height: 16,
        tintColor: Colors.BlackColor500,
        marginRight: 8,
    },
    suggestionText: {
        fontSize: Fonts.size._14px,
        fontFamily: Fonts.name.regular,
        color: Colors.BlackColor600,
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyStateIcon: {
        width: 48,
        height: 48,
        marginBottom: 12,
        tintColor: Colors.BlackColor400,
    },
    emptyStateText: {
        fontSize: Fonts.size._14px,
        fontFamily: Fonts.name.regular,
        color: Colors.BlackColor600,
        textAlign: 'center',
        lineHeight: 20,
    },
    routeNameInputContainer: {
        marginVertical: 4,
    },
    routeNameInput: {
        fontSize: Fonts.size._20px,
        fontFamily: Fonts.name.bold,
        color: Colors.Defaultblack,
        padding: 0,
        borderBottomWidth: 1,
        borderBottomColor: Colors.Blue500,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: Colors.Defaultwhite,
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalTitle: {
        fontSize: Fonts.size._18px,
        fontFamily: Fonts.name.bold,
        color: Colors.BlackColor900,
        marginBottom: 16,
        textAlign: 'center',
    },
    modalInput: {
        borderWidth: 1,
        borderColor: Colors.BlackColor300,
        borderRadius: 8,
        padding: 12,
        fontSize: Fonts.size._16px,
        fontFamily: Fonts.name.regular,
        color: Colors.Defaultblack,
        marginBottom: 20,
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    modalButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginLeft: 12,
    },
    modalButtonPrimary: {
        backgroundColor: Colors.Blue500,
    },
    modalButtonTextCancel: {
        fontSize: Fonts.size._14px,
        fontFamily: Fonts.name.medium,
        color: Colors.BlackColor600,
    },
    modalButtonTextSave: {
        fontSize: Fonts.size._14px,
        fontFamily: Fonts.name.medium,
        color: Colors.Defaultwhite,
    },
    startRouteButton: {
        borderColor: Colors.Green500,
        // backgroundColor: Colors.Green500,
    },
    startLocationDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: Colors.Green500,
        marginRight: 16,
        marginLeft: 8,
        borderWidth: 2,
        borderColor: Colors.White,
        marginTop: 10,
    },
    optionTitleSpecial: {
        fontSize: Fonts.size._14px,
        fontFamily: Fonts.name.medium,
        color: Colors.Defaultblack,
        marginBottom: 4,
    },
    optionSubtitleSpecial: {
        fontSize: Fonts.size._12px,
        fontFamily: Fonts.name.regular,
        color: Colors.BlackColor600,
    },
    endLocationDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: Colors.Red500,
        marginRight: 16,
        marginLeft: 8,
        borderWidth: 2,
        borderColor: Colors.White,
        marginTop: 10,
    },
    routeOptionsGroup: {
        marginVertical: 16,
    },
    locationSpecialIcon: {
        width: 16,
        height: 16,
        tintColor: Colors.Red500,
        marginLeft: 8,
    },
    extraFieldsContainer: {
        flex: 1,
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingTop: 16,
        gap: 8,
    },
    extraLabelsContainer: {
        alignItems: 'center',
        padding: 3,
        borderRadius: 8,
        borderColor: Colors.BlackColor200,
        borderWidth: 1,
        backgroundColor: Colors.BlackColor100,
    },
    labelText: {
        fontSize: Fonts.size._13px,
        fontFamily: Fonts.name.regular,
        color: Colors.BlackColor600,
    },
    locationIndex: {
        fontSize: Fonts.size._18px,
        fontFamily: Fonts.name.bold,
        color: Colors.Blue500,
    },
    locationIndexContainer: {
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 20,
        backgroundColor: Colors.Defaultwhite,
    },
    menuText: {
        fontSize: Fonts.size._14px,
        fontFamily: Fonts.name.regular,
        color: Colors.Defaultblack,
    },
    routeHeaderLeftContent: {
    },
    routeHeaderRightContent: {
        alignItems: 'flex-end',
    }
})

export default CircuitUI