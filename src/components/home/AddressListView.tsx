import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
} from 'react-native';
import { Colors, Fonts, Images, Utils } from '../../constants';
import { Place } from '../../model/LocationModel';
import { useTheme } from '../../context/ThemeContext';
import { store } from '../../App';
interface AddressListViewProps {
    startLocation?: {
        title?: string;
        subtitle?: string;
    };
    endLocation?: {
        title?: string;
        subtitle?: string;
        id?: number;
    };
    locations?: Place[];
    onLocationPress?: (location: Place) => void;
    showIndex?: boolean;
    isActiveRoute?: boolean;
    showTimeColumn?: boolean;
    startTime?: string;
    endTime?: string;
    onActiveRouteLocationPress?: (uniqueId: string) => void;
}

const AddressListView: React.FC<AddressListViewProps> = ({
    startLocation,
    endLocation,
    locations = [],
    onLocationPress,
    showIndex = true,
    isActiveRoute = false,
    showTimeColumn = false,
    startTime,
    endTime,
    onActiveRouteLocationPress,
}) => {
    const { theme, setTheme, isDarkMode } = useTheme();
    const session = store.getState()?.session;
    return (
        <View style={styles.container}>
            {/* Start location */}
            {startLocation && (
                <View style={styles.locationItem}>
                    <View style={[styles.optionLeftContent, { backgroundColor: Colors.Background(isDarkMode) }]}>
                        <View style={styles.startLocationDot} />
                        <View style={[styles.optionTextContainer, { backgroundColor: Colors.Background(isDarkMode), padding: 8 }]}>
                            <Text style={[styles.optionTitleSpecial, { color: Colors.Text(isDarkMode) }]}>
                                {startLocation?.title || "Current Location"}
                            </Text>
                            <Text style={[styles.optionSubtitleSpecial, { color: Colors.TextSecondary(isDarkMode) }]}>
                                {startLocation?.subtitle || "Starting point"}
                            </Text>
                        </View>
                    </View>
                    {showTimeColumn && (
                        <View style={styles.locationTimeColumn}>
                            <Text style={[styles.locationTime, { color: Colors.TextSecondary(isDarkMode) }]}>{startTime}</Text>
                        </View>
                    )}
                </View>
            )}

            {/* Location stops */}
            {locations.map((location, index) => (
                <TouchableOpacity
                    key={location.uniqueId || `location_${location.placeId}_${index}`}
                    style={[styles.locationItem, { backgroundColor: Colors.Background(isDarkMode) }]}
                    onPress={() => {
                        if (isActiveRoute) {
                            onActiveRouteLocationPress?.(location?.uniqueId || "");
                        } else {
                            onLocationPress?.(location);
                        }
                    }}
                >
                    <View style={[styles.optionLeftContent, { backgroundColor: Colors.Background(isDarkMode) }]}>
                        {showIndex && (
                            <View style={[styles.locationIndexContainer, { backgroundColor: Colors.Background(isDarkMode) }]}>
                                <Text style={[styles.locationIndex]}>{index + 1}</Text>
                                {index < locations.length - 1 && (
                                    <View style={[styles.verticalLine]} />
                                )}
                            </View>
                        )}
                        <View style={{ flex: 1 }}>
                            <View style={[styles.optionTextContainer, { backgroundColor: Colors.Background(isDarkMode) }]}>
                                <Text style={[
                                    styles.optionTitle,
                                    { color: Colors.Text(isDarkMode) },
                                    isActiveRoute && location.isCompleted && styles.completedLocationText
                                ]}>
                                    {location.title}
                                </Text>
                                <Text style={[
                                    styles.optionSubtitle,
                                    { color: Colors.TextSecondary(isDarkMode) },
                                    isActiveRoute && location.isCompleted && styles.completedLocationText
                                ]}>
                                    {location.subtitle}
                                </Text>
                            </View>
                            {session?.preferences?.navigationModeBubble && (
                                <View style={styles.extraFieldsContainer}>
                                    {location?.packageFinder?.size &&
                                        <View style={[styles.extraLabelsContainer, { backgroundColor: Colors.BackgroundSecondary(isDarkMode), borderColor: Colors.Border(isDarkMode) }]}>
                                            <Text style={[styles.labelText, { color: Colors.TextSecondary(isDarkMode) }]}>{location?.packageFinder?.size}</Text>
                                        </View>
                                    }
                                    {location?.packageFinder?.type &&
                                        <View style={[styles.extraLabelsContainer, { backgroundColor: Colors.BackgroundSecondary(isDarkMode), borderColor: Colors.Border(isDarkMode) }]}>
                                            <Text style={[styles.labelText, { color: Colors.TextSecondary(isDarkMode) }]}>{location?.packageFinder?.type}</Text>
                                        </View>
                                    }
                                    {location?.packageFinder?.position &&
                                        <View style={[styles.extraLabelsContainer, { backgroundColor: Colors.BackgroundSecondary(isDarkMode), borderColor: Colors.Border(isDarkMode) }]}>
                                            <Text style={[styles.labelText, { color: Colors.TextSecondary(isDarkMode) }]}>
                                                {
                                                    [location?.packageFinder?.position?.horizontal?.[0], location?.packageFinder?.position?.leftRight?.[0], location?.packageFinder?.position?.heightPosition?.[0]].filter(Boolean).join(' ')}
                                            </Text>
                                        </View>
                                    }
                                    {location?.orderType && location?.orderType !== 'auto' &&
                                        <View style={[styles.extraLabelsContainer, { backgroundColor: Colors.BackgroundSecondary(isDarkMode), borderColor: Colors.Border(isDarkMode) }]}>
                                            <Text style={[styles.labelText, { color: Colors.TextSecondary(isDarkMode) }]}>{location?.orderType}</Text>
                                        </View>
                                    }
                                    {location?.timeAtStop &&
                                        <View style={[styles.extraLabelsContainer, { backgroundColor: Colors.BackgroundSecondary(isDarkMode), borderColor: Colors.Border(isDarkMode) }]}>
                                            <Text style={[styles.labelText, { color: Colors.TextSecondary(isDarkMode) }]}>{location?.timeAtStop?.minutes || 0} min {location?.timeAtStop?.seconds || 0} sec</Text>
                                        </View>
                                    }
                                    {location?.arrivalTime &&
                                        <View style={[styles.extraLabelsContainer, { backgroundColor: Colors.BackgroundSecondary(isDarkMode), borderColor: Colors.Border(isDarkMode) }]}>
                                            <Text style={[styles.labelText, { color: Colors.TextSecondary(isDarkMode) }]}>{Utils.formatTime(location?.arrivalTime?.from || "")} - {Utils.formatTime(location?.arrivalTime?.to || "")}</Text>
                                        </View>
                                    }
                                    {location?.stopType && location?.stopType !== 'delivery' &&
                                        <View style={[styles.extraLabelsContainer, { backgroundColor: Colors.BackgroundSecondary(isDarkMode), borderColor: Colors.Border(isDarkMode) }]}>
                                            <Text style={[styles.labelText, { color: Colors.TextSecondary(isDarkMode) }]}>{location?.stopType}</Text>
                                        </View>
                                    }
                                    {location?.packageCount && location?.packageCount > 1 &&
                                        <View style={[styles.extraLabelsContainer, { backgroundColor: Colors.BackgroundSecondary(isDarkMode), borderColor: Colors.Border(isDarkMode) }]}>
                                            <Text style={[styles.labelText, { color: Colors.TextSecondary(isDarkMode) }]}>{location?.packageCount}</Text>
                                        </View>
                                    }
                                </View>
                            )}
                        </View>
                    </View>
                    {!isActiveRoute && (
                        <Image source={Images.ic_chevron_right} style={[styles.chevronIcon, { tintColor: Colors.TextSecondary(isDarkMode) }]} />
                    )}
                    {showTimeColumn && (
                        <View style={styles.locationTimeColumn}>
                            <Text style={[styles.locationTime, { color: Colors.TextSecondary(isDarkMode) }]}>
                                {location.isCompleted
                                    ? Utils.formatTime(location?.deliveryTime || new Date().toString())
                                    : Utils.formatTime(new Date(new Date().getTime() + (index + 1) * 15 * 60000).toString())
                                }
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
            ))
            }

            {/* End location */}
            {
                endLocation && endLocation.id !== 3 && (
                    <View style={[styles.locationItem, { backgroundColor: Colors.Background(isDarkMode) }]}>
                        <View style={[styles.optionLeftContent, { backgroundColor: Colors.Background(isDarkMode) }]}>
                            <View style={
                                endLocation.id === 1 ?
                                    styles.startLocationDot :
                                    styles.endLocationDot
                            } />
                            <View style={[styles.optionTextContainer, { backgroundColor: Colors.BackgroundSecondary(isDarkMode), padding: 8 }]}>
                                <Text style={[styles.optionTitleSpecial, { color: Colors.Text(isDarkMode) }]}>
                                    {endLocation.title || "End Location"}
                                </Text>
                                <Text style={[styles.optionSubtitleSpecial, { color: Colors.TextSecondary(isDarkMode) }]}>
                                    {endLocation.subtitle || "Final destination"}
                                </Text>
                            </View>
                        </View>
                        {showTimeColumn && (
                            <View style={styles.locationTimeColumn}>
                                <Text style={[styles.locationTime, { color: Colors.TextSecondary(isDarkMode) }]}>{endTime}</Text>
                            </View>
                        )}
                    </View>
                )
            }
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    locationItem: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    optionLeftContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flex: 1,
        zIndex: 1000,
        backgroundColor: Colors.Defaultwhite,
    },
    startLocationDot: {
        width: 15,
        height: 15,
        borderRadius: 6,
        backgroundColor: Colors.Green500,
        borderWidth: 2,
        borderColor: Colors.Defaultwhite,
        marginRight: 16,
        marginLeft: 5,
        marginTop: 10,
    },
    endLocationDot: {
        width: 15,
        height: 15,
        borderRadius: 6,
        backgroundColor: Colors.Red500,
        borderWidth: 2,
        borderColor: Colors.Defaultwhite,
        marginRight: 16,
        marginLeft: 8,
        marginTop: 10,
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
    chevronIcon: {
        width: 16,
        height: 16,
        tintColor: Colors.BlackColor500,
        // marginRight: 16,
        marginTop: 10,
    },
    locationIndexContainer: {
        width: 25,
        height: 25,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 20,
        backgroundColor: Colors.Defaultwhite,
        position: 'relative',
    },
    locationIndex: {
        fontSize: Fonts.size._18px,
        fontFamily: Fonts.name.bold,
        color: Colors.Blue500,
    },
    verticalLine: {
        position: 'absolute',
        left: '50%',
        top: '100%',
        width: 2,
        backgroundColor: Colors.Blue500,
        height: '400%',
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
    completedLocationText: {
        color: Colors.BlackColor400,
        textDecorationLine: 'line-through',
    },
});

export default AddressListView; 