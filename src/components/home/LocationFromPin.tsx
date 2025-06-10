import React, { useEffect, useRef, useState } from 'react'
import { Image, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Button, WarpperComponent } from '../common'
import { BaseProps, Colors, Fonts, Images } from '../../constants'
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { DEFAULT_REGION } from '../../data/defaultData';
import { KEY_USER_LOCATION } from '../../data/storeKey';
import { getAddressFromLatLng } from '../../api/LocationAPI';
import { goBack } from '../../navigation/RootNavigation';
import { MenuView, MenuComponentRef } from '@react-native-menu/menu';
import { useTheme } from '../../context/ThemeContext';


const LocationFromPin: React.FC<BaseProps> = ({ navigation, route, session }) => {
    const { theme, setTheme, isDarkMode } = useTheme();
    const menuRef = useRef<MenuComponentRef>(null);

    const mapRef = useRef<MapView>(null);
    const [address, setAddress] = useState<string>('');
    const [primaryAddress, setPrimaryAddress] = useState<string>('');
    const [region, setRegion] = useState<Region>(DEFAULT_REGION);
    // useEffect(() => {
    //     handleRegionChangeComplete(session?.user_location || DEFAULT_REGION);
    // }, []);
    const handleRegionChangeComplete = async (region: Region) => {
        let address = await getAddressFromLatLng(region)
        setRegion(region)
        const addressParts = address.split(',');
        setPrimaryAddress(addressParts[0]);
        setAddress(addressParts.slice(1).join(','));
    }
    const handlelocationSubmit = () => {
        const selectedLocation = {
            latitude: region?.latitude,
            longitude: region.longitude,
            full_text: address,
            primary_text: primaryAddress,
        }
        if (route.params?.onDone && selectedLocation.latitude && selectedLocation.longitude && selectedLocation.full_text && selectedLocation.primary_text) {
            route.params.onDone(selectedLocation)
            goBack()
        }
    }
    return (
        <View style={[styles.container, { backgroundColor: Colors.Background(isDarkMode) }]}>
            <StatusBar backgroundColor="transparent" barStyle="dark-content" />
            <View style={styles.headerContainer}>
                <MapView
                    style={styles.map}
                    provider={PROVIDER_GOOGLE}
                    showsUserLocation={true}
                    showsMyLocationButton={true}
                    ref={mapRef}
                    initialRegion={{
                        latitude:
                            session?.user_location?.latitude || DEFAULT_REGION.latitude,
                        longitude:
                            session?.user_location?.longitude || DEFAULT_REGION.longitude,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                    onRegionChangeComplete={handleRegionChangeComplete}
                    onMapReady={() => {
                        handleRegionChangeComplete(session?.user_location || DEFAULT_REGION);
                    }}
                    zoomTapEnabled
                />
                <TouchableOpacity
                    style={[styles.menuButton, { backgroundColor: Colors.Background(isDarkMode) }]}
                    onPress={() => goBack()}
                >
                    <Image
                        source={Images.ic_back}
                        style={[styles.menuIcon, { tintColor: Colors.Text(isDarkMode) }]}
                    />
                </TouchableOpacity>
                <View style={styles.MarkerStyle}>
                    <Image
                        style={{ height: 50, width: 50, resizeMode: 'contain' }}
                        source={Images.ic_pin_location_live}
                    />
                </View>
            </View>
            <View style={[styles.buttonContainer, { backgroundColor: Colors.Background(isDarkMode) }]}>
                <Text style={[styles.primaryText, { color: Colors.Text(isDarkMode) }]}>{primaryAddress}</Text>
                <Text style={[styles.secondaryText, { color: Colors.TextSecondary(isDarkMode) }]}>{address}</Text>
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 16 }}>
                    <Button
                        style={styles.optimizeButton}
                        title="Get Location"
                        onPress={() => {
                            handlelocationSubmit()
                        }}
                        buttonTitleStyle={styles.optimizeButtonText}
                        leftImageStyle={{ tintColor: Colors.Defaultwhite }}
                        leftImage={Images.ic_add}
                    />
                </View>
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    headerContainer: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    buttonContainer: {
        minHeight: "25%",
        backgroundColor: Colors.defaultWhite,
        padding: 10,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        width: '100%',
    },
    primaryText: {
        color: Colors.defaultBlack,
        fontSize: Fonts.size._16px,
        fontFamily: Fonts.name.medium,
        padding: 16,
    },
    secondaryText: {
        color: Colors.defaultBlack,
        fontSize: Fonts.size._14px,
        fontFamily: Fonts.name.regular,
        paddingHorizontal: 15,
        paddingBottom: 10,
    },
    MarkerStyle: {
        position: 'absolute',
        top: '47%',
        left: '50%',
        transform: [{ translateX: -25 }, { translateY: -25 }], // Adjust for the image size
        alignItems: 'center',
        justifyContent: 'center',

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
})

export default WarpperComponent(LocationFromPin);