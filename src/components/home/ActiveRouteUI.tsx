import React, { useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
    Share
} from 'react-native';
import { Colors, Fonts, Images, Utils } from '../../constants';
import Strings from '../../language/Strings';
import { Place, RouteTrip } from '../../model/LocationModel';
import { ScrollView } from 'react-native-gesture-handler'
import LottieView from 'lottie-react-native';
import AddressListView from './AddressListView';
import { useTheme } from '../../context/ThemeContext';
import { store } from '../../App';

interface ActiveRouteUIProps {
    routeTrip: RouteTrip;
    onMarkAsCompleted: (location: Place) => void;
    onEndRoute: () => void;
    openRouteNameModal: () => void;
    onRouteDetails: (fromBreak: boolean) => void;
    onActiveRouteLocationPress: (uniqueId: string) => void;
    isRouteCompleted: boolean;
}

const ActiveRouteUI: React.FC<ActiveRouteUIProps> = ({
    routeTrip,
    onMarkAsCompleted,
    onEndRoute,
    openRouteNameModal,
    onRouteDetails,
    onActiveRouteLocationPress,
    isRouteCompleted
}) => {
    const session = store.getState()?.session;
    const { isDarkMode } = useTheme();
    // Share route with others
    const shareRoute = async () => {
        try {
            const message = `Route: ${routeTrip?.routeName}\nStops: ${routeTrip?.locations?.length}\nDistance: ${routeTrip?.distance} km`;
            await Share.share({
                message,
            });
        } catch (error) {
            console.error('Error sharing route:', error);
        }
    };

    return (
        <ScrollView >
            <View style={[styles.container, { backgroundColor: Colors.Background(isDarkMode) }]}>
                {/* Header with route info */}
                <View style={[styles.header, { backgroundColor: Colors.Background(isDarkMode), borderBottomColor: Colors.Border(isDarkMode) }]}>
                    <View style={styles.routeHeaderTopRow}>
                        <View style={styles.routeHeaderLeftContent}>
                            <Text style={[styles.stopsCount, { color: Colors.Text(isDarkMode) }]}>{routeTrip?.locations?.length} {Strings.stops_count}</Text>
                            <Text style={[styles.stopsCount, { color: Colors.Text(isDarkMode) }]}>{Utils.formatDuration(routeTrip?.time || 0)} - {Utils.getDistance(routeTrip?.distance || 0, session?.preferences?.distanceUnit || 'Kilometers')}</Text>
                        </View>
                        <View style={styles.routeHeaderRightContent}>
                            <Text style={[styles.routeInfoText, { color: Colors.Text(isDarkMode) }]}>
                                {`Start ${Utils.formatTime(Utils.getStartTime() || new Date())}`}
                            </Text>
                            <Text style={[styles.routeInfoText, { color: Colors.Text(isDarkMode) }]}>
                                {`Finish ${Utils.formatTime(Utils.getEndTime() || new Date())}`}
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={openRouteNameModal}>
                        <Text style={[styles.routeName, { color: Colors.Text(isDarkMode) }]}>{routeTrip?.routeName}</Text>
                    </TouchableOpacity>

                    {/* Action buttons */}
                    <View style={styles.actionButtons}>
                        <TouchableOpacity style={styles.actionButton} onPress={shareRoute}>
                            <Image source={Images.ic_share} style={styles.actionIcon} />
                            <Text style={styles.actionText}>Share live route</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={() => { }}>
                            <Image source={Images.ic_add} style={styles.actionIcon} />
                            <Text style={styles.actionText}>Load vehicle</Text>
                        </TouchableOpacity>
                    </View>
                    {/* Break info */}
                    <TouchableOpacity style={[styles.breakInfoContainer, { borderTopColor: Colors.Border(isDarkMode) }]} onPress={() => !isRouteCompleted && onRouteDetails?.(true)}>
                        <View style={styles.breakInfo}>
                            <LottieView source={Images.Break_Time}
                                autoPlay
                                loop
                                style={styles.breakIcon} />
                            {/* <Image source={Images.ic_break} style={styles.breakIcon} /> */}
                            <View>
                                {routeTrip?.extraCricuitData?.breakSetup?.duration ?
                                    <Text style={[styles.breakTitle, { color: Colors.Text(isDarkMode) }]}>{routeTrip?.extraCricuitData?.breakSetup?.duration + " break" || Strings.no_break}</Text> :
                                    <Text style={[styles.breakTitle, { color: Colors.Text(isDarkMode) }]}>{Strings.no_break}</Text>
                                }
                                {routeTrip?.extraCricuitData?.breakSetup?.startTime && routeTrip?.extraCricuitData?.breakSetup?.endTime ?
                                    <Text style={[styles.breakSubtitle, { color: Colors.TextSecondary(isDarkMode) }]}>{"Between " + Utils.formatTime(routeTrip?.extraCricuitData?.breakSetup?.startTime) + " - " + Utils.formatTime(routeTrip?.extraCricuitData?.breakSetup?.endTime) || Strings.tap_to_plan_break}</Text> :
                                    <Text style={[styles.breakSubtitle, { color: Colors.TextSecondary(isDarkMode) }]}>{Strings.tap_to_plan_break}</Text>
                                }
                            </View>
                        </View>
                        {!isRouteCompleted &&
                            <Image source={Images.ic_chevron_right} style={[styles.chevronIcon, { tintColor: Colors.TextSecondary(isDarkMode) }]} />
                        }
                    </TouchableOpacity>
                </View>

                {/* Locations list */}
                <View style={styles.locationsContainer}>
                    <AddressListView
                        // startLocation={routeTrip.extraCricuitData?.startLocation}
                        endLocation={routeTrip?.extraCricuitData?.endLocation}
                        locations={routeTrip?.locations}
                        isActiveRoute={true}
                        showTimeColumn={true}
                        startTime={Utils.formatTime(routeTrip?.startTime || '')}
                        endTime={Utils.formatTime(routeTrip?.endTime || '')}
                        onActiveRouteLocationPress={onActiveRouteLocationPress}
                    />
                </View>
                {/* <View style={styles.completeButtonContainer}>
                    <TouchableOpacity style={styles.completeButton} onPress={onEndRoute}>
                        <Image source={Images.ic_check} style={styles.completeButtonIcon} />
                        <Text style={styles.completeButtonText}>Mark route as completed</Text>
                    </TouchableOpacity>
                </View> */}
            </View>

            {/* Mark as completed button */}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 16,
        width: '100%',
        height: '100%',
        backgroundColor: Colors.Defaultwhite,
    },
    header: {
        // padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.BlackColor200,
    },
    routeInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    finishText: {
        fontSize: Fonts.size._12px,
        fontFamily: Fonts.name.regular,
        color: Colors.BlackColor600,
    },
    routeName: {
        fontSize: Fonts.size._20px,
        fontFamily: Fonts.name.bold,
        color: Colors.Defaultblack,
        marginBottom: 12,
    },
    actionButtons: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
    },
    actionIcon: {
        width: 16,
        height: 16,
        tintColor: Colors.Blue500,
        marginRight: 8,
    },
    actionText: {
        fontSize: Fonts.size._14px,
        fontFamily: Fonts.name.medium,
        color: Colors.Blue500,
    },
    breakInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.BlackColor200,
    },
    breakInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    breakIcon: {
        width: 25,
        height: 25,
        tintColor: Colors.BlackColor600,
        marginRight: 23,
    },
    breakTitle: {
        fontSize: Fonts.size._14px,
        fontFamily: Fonts.name.medium,
        color: Colors.Defaultblack,
    },
    breakSubtitle: {
        fontSize: Fonts.size._12px,
        fontFamily: Fonts.name.regular,
        color: Colors.BlackColor600,
    },
    chevronIcon: {
        width: 16,
        height: 16,
        tintColor: Colors.BlackColor500,
    },
    locationsContainer: {
        // paddingLeft: 16,
        marginTop: 16,
    },
    locationItem: {
        flexDirection: 'row',
        marginBottom: 2,
    },
    locationTimeColumn: {
        width: 53,
        paddingTop: 16,
        alignItems: 'flex-end',
        marginRight: 4,
    },
    locationTime: {
        fontSize: Fonts.size._12px,
        fontFamily: Fonts.name.medium,
        color: Colors.BlackColor700,
    },
    locationContent: {
        flex: 1,
        flexDirection: 'row',
        paddingVertical: 16,
        paddingRight: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.BlackColor200,
    },
    locationIconContainer: {
        width: 20,
        alignItems: 'center',
        marginRight: 12,
    },
    startLocationDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: Colors.Green500,
        borderWidth: 2,
        borderColor: Colors.Defaultwhite,
    },
    locationDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.Blue500,
    },
    completedLocationDot: {
        backgroundColor: Colors.BlackColor400,
    },
    endLocationDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: Colors.Red500,
        borderWidth: 2,
        borderColor: Colors.Defaultwhite,
    },
    locationDetails: {
        flex: 1,
    },
    locationTitle: {
        fontSize: Fonts.size._14px,
        fontFamily: Fonts.name.medium,
        color: Colors.Defaultblack,
        marginBottom: 4,
    },
    locationSubtitle: {
        fontSize: Fonts.size._12px,
        fontFamily: Fonts.name.regular,
        color: Colors.BlackColor600,
    },
    completedLocationText: {
        color: Colors.BlackColor400,
        textDecorationLine: 'line-through',
    },
    markButton: {
        backgroundColor: Colors.Blue500,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
        alignSelf: 'center',
        marginLeft: 8,
    },
    markButtonText: {
        fontSize: Fonts.size._12px,
        fontFamily: Fonts.name.medium,
        color: Colors.Defaultwhite,
    },
    completedContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.Green500,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginLeft: 8,
    },
    checkIcon: {
        width: 16,
        height: 16,
        tintColor: Colors.Defaultwhite,
    },
    completeButtonContainer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: Colors.BlackColor200,
    },
    completeButton: {
        backgroundColor: Colors.Green500,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
    },
    completeButtonIcon: {
        width: 20,
        height: 20,
        tintColor: Colors.Defaultwhite,
        marginRight: 8,
    },
    completeButtonText: {
        fontSize: Fonts.size._16px,
        fontFamily: Fonts.name.medium,
        color: Colors.Defaultwhite,
    },
    routeHeaderTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    routeHeaderLeftContent: {
    },
    routeHeaderRightContent: {
        alignItems: 'flex-end',
    },
    stopsCount: {
        fontSize: Fonts.size._12px,
        fontFamily: Fonts.name.regular,
        color: Colors.BlackColor600,
        marginBottom: 4,
    },
    routeInfoText: {
        fontSize: Fonts.size._12px,
        fontFamily: Fonts.name.medium,
        color: Colors.BlackColor700,
        marginBottom: 4,
    },
});

export default ActiveRouteUI; 