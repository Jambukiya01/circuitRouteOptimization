import React, { useEffect, useState } from 'react'
import { SessionState } from '../../store/reducers/SessionReducer';
import { store } from '../../App';
import { FlatList, Image, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Fonts, Images, Utils } from '../../constants';
import { Button, ContextMenu } from '../common';
import Strings from '../../language/Strings';
import LinearGradient from 'react-native-linear-gradient'
import { ScrollView } from 'react-native-gesture-handler'
import { navigate, reset } from '../../navigation/RootNavigation';
import { useDispatch } from 'react-redux';
import { setSessionField } from '../../store/actions/SessionActions';
import { KEY_CURRENT_ROUTE_TRIP, KEY_ROUTE_TRIP_DATA } from '../../data/storeKey';
import { RouteTrip } from '../../model/LocationModel';
import { useTheme } from '../../context/ThemeContext';
const menuActions = [
    {
        id: '1',
        title: 'Set name and date',
        titleColor: Colors.TextColor,
    },
    {
        id: '2',
        title: 'Duplicate route',
        titleColor: Colors.TextColor,
    },
    {
        id: '3',
        title: 'Delete route',
        titleColor: Colors.TextColor,
    },
]

const Sidemenu: React.FC<any> = ({ navigation, index }) => {
    const { theme, setTheme, isDarkMode } = useTheme();
    let session: SessionState = store.getState().session;
    const dispatch = useDispatch()
    const setSession = (key: string, value: any) => {
        dispatch(setSessionField(key, value) as any)
    }
    const tripsArray = session?.route_trip_data || [];

    // Add safety check for menuActions
    const getMenuActions = () => {
        if (!menuActions || !Array.isArray(menuActions)) {
            console.warn('menuActions is invalid:', menuActions);
            return [];
        }
        return menuActions ?? [];
    };

    const groupTripsByDate = (trips: RouteTrip[]) => {
        const groupedTrips: { [key: string]: RouteTrip[] } = {};

        trips.forEach((trip) => {
            if (!trip.date) {
                // If date is missing, add to "Unknown" group
                const dateLabel = "Unknown";
                if (!groupedTrips[dateLabel]) {
                    groupedTrips[dateLabel] = [];
                }
                groupedTrips[dateLabel].push(trip);
                return;
            }

            try {
                const dateLabel = Utils.getFormattedDate(trip.date); // Get formatted date label

                if (!groupedTrips[dateLabel]) {
                    groupedTrips[dateLabel] = [];
                }
                groupedTrips[dateLabel].push(trip);
            } catch (error) {
                console.error('Error grouping trip by date:', error);
                // If there's an error, add to "Unknown" group
                const dateLabel = "Unknown";
                if (!groupedTrips[dateLabel]) {
                    groupedTrips[dateLabel] = [];
                }
                groupedTrips[dateLabel].push(trip);
            }
        });

        return groupedTrips;
    };
    const sortedTrips = [...tripsArray].sort((a, b) => {
        // If either trip doesn't have a date, put it at the end
        if (!a.date) return 1;
        if (!b.date) return -1;

        // Safely parse dates
        try {
            const dateA = Utils.parseDate(a.date);
            const dateB = Utils.parseDate(b.date);

            // Check if dates are valid
            const isDateAValid = !isNaN(dateA.getTime());
            const isDateBValid = !isNaN(dateB.getTime());

            // If either date is invalid, sort it to the end
            if (!isDateAValid) return 1;
            if (!isDateBValid) return -1;

            const isAToday = Utils.isDateToday(a.date);
            const isBToday = Utils.isDateToday(b.date);
            const isATomorrow = Utils.isDateTomorrow(a.date);
            const isBTomorrow = Utils.isDateTomorrow(b.date);
            const isAYesterday = Utils.isDateYesterday(a.date);
            const isBYesterday = Utils.isDateYesterday(b.date);

            // 1️⃣ Today first
            if (isAToday && !isBToday) return -1;
            if (!isAToday && isBToday) return 1;

            // 2️⃣ Tomorrow second
            if (isATomorrow && !isBTomorrow) return -1;
            if (!isATomorrow && isBTomorrow) return 1;

            // 3️⃣ Yesterday third
            if (isAYesterday && !isBYesterday) return -1;
            if (!isAYesterday && isBYesterday) return 1;

            // 4️⃣ Other dates: Sort newest to oldest
            return dateB.getTime() - dateA.getTime();
        } catch (error) {
            console.error('Error sorting trips:', error);
            return 0; // Don't change order on error
        }
    });
    const groupedTrips = groupTripsByDate(sortedTrips);

    const handleRoutePress = (tripId: string) => {
        if (tripId === session?.current_route_trip?.tripId) {
            navigation.closeDrawer();
            return;
        }
        setSession(KEY_CURRENT_ROUTE_TRIP, tripsArray.find((trip) => trip.tripId === tripId));
        navigation.closeDrawer();
    }
    return (
        <SafeAreaView style={{ backgroundColor: Colors.Background(isDarkMode), flex: 1, }}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={Colors.Background(isDarkMode)} />
            <View style={styles.maincontainer}>
                <LinearGradient
                    colors={[Colors.GradientStartColor(isDarkMode), Colors.GradientEndColor(isDarkMode)]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ width: '100%' }}
                >
                    <View style={styles.headerContainer}>
                        <View style={styles.logoContainer}>
                            <TouchableOpacity onPress={() => navigate('Help')}>
                                <Image
                                    source={Images.ic_help}
                                    style={[styles.logo, , { tintColor: Colors.Text(isDarkMode) }]}
                                    resizeMode="contain"
                                />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => navigate('Settings')}>
                                <Image
                                    source={Images.ic_SideSettingUnSelectedIcon}
                                    style={[styles.logo, , { tintColor: Colors.Text(isDarkMode) }]}
                                    resizeMode="contain"
                                />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.profileContainer}>
                            <Image
                                source={Images.ic_introimage}
                                style={styles.profileImage}
                                resizeMode="cover"
                            />
                            <View style={styles.userInfo}>
                                <Text style={[styles.userName, { color: Colors.Text(isDarkMode) }]}>
                                    {session?.user?.name || 'User Name'}
                                </Text>
                                <Text style={[styles.userEmail, { color: Colors.Text(isDarkMode) }]}>
                                    {session?.user?.email || 'user@email.com'}
                                </Text>
                                <Text style={[styles.userStatus, { color: Colors.TextSecondary(isDarkMode) }]}>
                                    {session?.user?.status || 'Free Plan'}
                                </Text>
                            </View>
                        </View>
                        <Button
                            style={[styles.subscribeButton, { backgroundColor: Colors.Background(isDarkMode), borderColor: Colors.Border(isDarkMode) }]}
                            title={Strings.subscribe}
                            onPress={() => {
                                console.log('onPress');
                                setSession(KEY_CURRENT_ROUTE_TRIP, undefined)
                                setSession(KEY_ROUTE_TRIP_DATA, [])
                                reset('LoginOptions')
                            }}
                            leftImage={Images.ic_subscribe}
                            buttonTitleStyle={styles.buttonTitleStyle}
                            leftImageStyle={{ tintColor: Colors.Blue500 }}
                        />
                    </View>
                </LinearGradient>

                <View style={styles.menuContainer}>
                    <ScrollView>
                        {Object.entries(groupedTrips).map(([dateLabel, trips]) => (
                            <View key={dateLabel}>
                                {/* Date Header */}
                                <Text style={[styles.menuItemHeaderText, { color: Colors.TextSecondary(isDarkMode) }]}>{dateLabel}</Text>

                                {/* List of trips under the date */}
                                {trips.map((item: RouteTrip) => (
                                    <TouchableOpacity
                                        key={item.tripId}
                                        style={[styles.menuItem, { borderBottomColor: Colors.Border(isDarkMode) }]}
                                        onPress={() => handleRoutePress(item.tripId)}>
                                        <View style={[styles.menuItemContent, session?.current_route_trip?.tripId === item.tripId ? { backgroundColor: isDarkMode ? "#293143" : "#f1f5ff" } : { backgroundColor: Colors.Background(isDarkMode) }]}>
                                            <View style={styles.menuItemContentRight}>
                                                <Text style={[styles.menuItemContentText, session?.current_route_trip?.tripId === item.tripId ? { color: Colors.Blue500 } : { color: Colors.Text(isDarkMode) }]}>{item.date ? Utils.formatDate(item.date, 'DD, MMM', false) : ''}</Text>
                                                <Text style={[styles.menuItemRouteName, session?.current_route_trip?.tripId === item.tripId ? { color: Colors.Blue500 } : { color: Colors.Text(isDarkMode) }]}>{item.routeName}</Text>
                                            </View>
                                            <ContextMenu
                                                actions={getMenuActions()}
                                                onPressAction={(nativeEvent) => {
                                                    console.log('ContextMenu pressed:', nativeEvent);
                                                }}
                                                moreOptionsIconStyle={{
                                                    tintColor: session?.current_route_trip?.tripId === item.tripId ? Colors.Blue500 : Colors.Text(isDarkMode)
                                                }}
                                            />
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ))}
                    </ScrollView>
                </View>
                <View style={styles.bottomContainer}>
                    <Button
                        title={Strings.create_route}
                        onPress={() => {
                            navigation.navigate('AddRouteTrip');
                        }}
                        style={[styles.createRouteButton, { backgroundColor: Colors.Background(isDarkMode), borderColor: Colors.Border(isDarkMode) }]}
                        leftImage={Images.ic_add}
                        buttonTitleStyle={styles.createRouteButtonTitleStyle}
                        leftImageStyle={{ tintColor: Colors.Defaultwhite }}
                    />
                </View>
            </View>
        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    maincontainer: {
        flex: 1,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    logo: {
        tintColor: Colors.Defaultblack,
        height: 25,
        width: 25,
        marginRight: 10
    },
    headerContainer: {
        padding: 18,

    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    profileImage: {
        height: 60,
        width: 60,
        borderRadius: 25,
    },
    userInfo: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        marginLeft: 15
    },
    userName: {
        fontSize: 16,
        fontFamily: Fonts.name.bold,
        marginBottom: 5
    },
    userEmail: {
        fontSize: 14,
        fontFamily: Fonts.name.medium,
        marginBottom: 5
    },
    userStatus: {
        fontSize: 12,
        fontFamily: Fonts.name.regular,
        color: Colors.TextColor
    },
    subscribeButton: {
        height: 40,
        marginTop: 20,
        backgroundColor: Colors.Defaultwhite,
        borderWidth: 2,
        borderColor: "#E9EEFB",
        borderRadius: 10,
    },
    buttonTitleStyle: {
        fontSize: 14,
        fontFamily: Fonts.name.medium,
        color: Colors.Blue500
    },
    menuContainer: {
        flex: 1,
        // backgroundColor: "blue"
    },
    menuItem: {
        borderBottomWidth: 1,
        borderBottomColor: "#E9EEFB",
        marginBottom: 10
    },
    menuItemHeaderText: {
        padding: 18,
        marginTop: 5,
        fontSize: 14,
        fontFamily: Fonts.name.regular,
        color: Colors.BlackColor700
    },
    menuItemContent: {
        marginHorizontal: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        backgroundColor: Colors.Defaultwhite,
    },
    menuItemContentText: {
        fontSize: 14,
        fontFamily: Fonts.name.medium,
        color: Colors.TextColor,
        marginRight: 10
    },
    menuItemRouteName: {
        fontSize: 14,
        fontFamily: Fonts.name.bold,
        color: Colors.BlackColor700,
        marginRight: 10
    },
    menuItemContentImage: {
        height: 20,
        width: 20,
        borderRadius: 5,
        marginLeft: 10,
        tintColor: Colors.Blue500
    },
    bottomContainer: {
        padding: 18,
    },
    createRouteButton: {
        height: 45,
        backgroundColor: Colors.Blue500,
        borderWidth: 1,
        borderColor: Colors.Blue500,
        borderRadius: 10,
    },
    createRouteButtonTitleStyle: {
        fontSize: 14,
        fontFamily: Fonts.name.medium,
        color: Colors.Defaultwhite
    },
    menuItemContentRight: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
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
    menuText: {
        fontSize: Fonts.size._14px,
        fontFamily: Fonts.name.regular,
        color: Colors.Defaultblack,
    }
})

export default Sidemenu