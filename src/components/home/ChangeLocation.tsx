import React from 'react'
import { WarpperComponent } from '../common'
import { BaseProps, Colors, Fonts, Images } from '../../constants'
import { View, TouchableOpacity, Image, TextInput, StyleSheet } from 'react-native'
import Strings from '../../language/Strings'
import navigation from '../../navigation'
import { getPlacesFromGoogle, getPlaceLatLngFromGoogle } from '../../api/LocationAPI'
import { PlaceItem } from '../../model/LocationModel'
import SearchLocation from './SearchLocation'
import { goBack } from '../../navigation/RootNavigation'
import LottieView from 'lottie-react-native'
import { useTheme } from '../../context/ThemeContext';
const ChangeLocation: React.FC<BaseProps> = ({ route }) => {
    const { isDarkMode } = useTheme();
    const [searchText, setSearchText] = React.useState('');
    const [placeData, setPlaceData] = React.useState<PlaceItem[]>([]);

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
        // Check if coordinates are missing or zero
        if (!place.latitude || !place.longitude || place.latitude === 0 || place.longitude === 0) {
            try {
                console.log("Fetching lat/lng for place:", place.primary_text);

                // Create a PlaceAutoPredictionModel from PlaceItem by adding the required address field
                const placeWithAddress = {
                    ...place,
                    address: place.full_text || '',
                };

                const coordinates = await getPlaceLatLngFromGoogle(placeWithAddress);

                if (coordinates && coordinates.latitude && coordinates.longitude) {
                    console.log("Got coordinates:", coordinates);
                    // Update the place object with the new coordinates
                    place = {
                        ...place,
                        latitude: coordinates.latitude,
                        longitude: coordinates.longitude
                    };
                }
            } catch (coordError) {
                console.error("Error fetching coordinates:", coordError);
                // Continue with the process even if coordinates fetching fails
            }
        }

        // Return the place (with updated coordinates if available)
        route.params?.onDone?.(place);
        goBack();
    }

    return (
        <View style={{ flex: 1, backgroundColor: Colors.Background(isDarkMode) }}>
            <TouchableOpacity style={styles.backButton} onPress={() => goBack()}>
                <Image
                    source={Images.ic_back}
                    style={[styles.backIcon, { tintColor: Colors.TextSecondary(isDarkMode) }]}
                />
            </TouchableOpacity>
            <View style={[styles.header, { borderBottomColor: Colors.Border(isDarkMode), backgroundColor: Colors.Background(isDarkMode) }]}>
                <View style={[styles.searchInputContainer, { backgroundColor: Colors.BackgroundSecondary(isDarkMode) }]}>
                    {/* <Image
                                source={Images.ic_search}
                                style={styles.searchIcon}
                            /> */}
                    <LottieView source={Images.Search}
                        autoPlay
                        loop
                        style={styles.searchIcon} />
                    <TextInput
                        style={[styles.searchInput, { color: Colors.Text(isDarkMode) }]}
                        placeholder={Strings.add_more_stops}
                        placeholderTextColor={Colors.BlackColor500}
                        value={searchText}
                        onChangeText={handleSearchChange}
                    />
                    {/* <View style={styles.iconContainer}>
                        <TouchableOpacity style={styles.locationsButton}>
                            <Image
                                source={Images.ic_pin}
                                style={styles.pinIcon}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.micButton}>
                            <Image
                                source={Images.ic_mic}
                                style={styles.micIcon}
                            />
                        </TouchableOpacity>
                    </View> */}
                </View>
            </View>
            <SearchLocation
                placeData={placeData}
                onPlaceSelect={handlePlaceSelect}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    header: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: Colors.BlackColor200,
        backgroundColor: Colors.Defaultwhite,
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
    },
    searchIcon: {
        width: 18,
        height: 18,
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
    backButton: {
        margin: 16,
    },
    backIcon: {
        tintColor: Colors.BlackColor500,
        width: 30,
        height: 30,
    }
})
export default WarpperComponent(ChangeLocation)