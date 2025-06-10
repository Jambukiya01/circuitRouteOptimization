import React from 'react'
import {
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Alert,
    Keyboard,
} from 'react-native'
import { Colors, Fonts, Images } from '../../constants'
import LottieView from 'lottie-react-native';
import { useTheme } from '../../context/ThemeContext';
import { PlaceItem } from '../../model/LocationModel';

interface SearchLocationProps {
    placeData?: PlaceItem[];
    onPlaceSelect?: (place: PlaceItem) => void;
}

const SearchLocation: React.FC<SearchLocationProps> = ({ placeData, onPlaceSelect }) => {
    const { theme, setTheme, isDarkMode } = useTheme();
    const handlePlacePress = (item: PlaceItem) => {
        console.log('Place item pressed:', item);
        if (onPlaceSelect) {
            onPlaceSelect(item);
        } else {
            console.error('onPlaceSelect callback is undefined');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: Colors.Background(isDarkMode) }]}>
            {placeData && placeData.length > 0 ? (
                <>
                    {/* Debug information */}
                    <View style={[styles.debugInfo, { backgroundColor: Colors.BackgroundSecondary(isDarkMode) }]}>
                        <Text style={[styles.debugText, { color: Colors.Text(isDarkMode) }]}>
                            {`Found ${placeData.length} places. Tap an item to select.`}
                        </Text>
                    </View>

                    {/* Using scrollview with map for more direct rendering */}
                    {placeData.map((item) => (
                        <TouchableOpacity
                            key={item.placeId}
                            style={[styles.placeItem, { backgroundColor: Colors.Background(isDarkMode) }]}
                            activeOpacity={0.7}
                            onPress={() => {
                                console.log('Direct map item pressed:', item.primary_text);
                                handlePlacePress(item);
                            }}
                        >
                            <View style={styles.placeIconContainer}>
                                <Image source={Images.ic_location} style={styles.placeIcon} />
                            </View>
                            <View style={styles.placeTextContainer}>
                                <Text style={[styles.primaryText, { color: Colors.Text(isDarkMode) }]}>{item.primary_text}</Text>
                                <Text style={[styles.fullText, { color: Colors.TextSecondary(isDarkMode) }]}>
                                    {item.full_text.replace(item.primary_text + ", ", "")}
                                </Text>
                            </View>
                            <Image source={Images.ic_chevron_right} style={[styles.chevronIcon, { tintColor: Colors.Text(isDarkMode) }]} />
                        </TouchableOpacity>
                    ))}
                </>
            ) : (
                <TouchableOpacity onPress={() => {
                    Keyboard.dismiss()
                }} style={{ flex: 1 }}>
                    <View style={styles.emptyStateContainer}>
                        {/* <Image source={Images.ic_empty_route} style={styles.emptyStateIcon} /> */}
                        <LottieView source={Images.Add_Location}
                            autoPlay
                            loop
                            style={styles.emptyStateIcon} />
                        <Text style={styles.emptyStateText}>Add new stops or find stops in{'\n'}your route</Text>
                    </View>
                    {/* <View style={styles.actionButtonsContainer}>
                        <TouchableOpacity style={styles.actionButton}>
                            <Image source={Images.ic_map} style={styles.actionIcon} />
                            <Text style={styles.actionText}>Map</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton}>
                            <Image source={Images.ic_scan} style={styles.actionIcon} />
                            <Text style={styles.actionText}>Scan</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton}>
                            <Image source={Images.ic_voice} style={styles.actionIcon} />
                            <Text style={styles.actionText}>Voice</Text>
                        </TouchableOpacity>
                    </View> */}
                </TouchableOpacity>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.Defaultwhite,
    },
    listContent: {
        paddingVertical: 8,
    },
    contentContainer: {
        flex: 1,
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
    actionButtonsContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        paddingHorizontal: 16,
        gap: 16,
    },
    actionButton: {
        alignItems: 'center',
        padding: 12,
        backgroundColor: Colors.Defaultwhite,
        borderRadius: 4,
        minWidth: 80,
    },
    actionIcon: {
        width: 24,
        height: 24,
        tintColor: Colors.BlackColor500,
        marginBottom: 4,
    },
    actionText: {
        fontSize: Fonts.size._12px,
        fontFamily: Fonts.name.regular,
        color: Colors.BlackColor600,
    },
    placeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: Colors.Defaultwhite,
    },
    placeIconContainer: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    placeIcon: {
        width: 24,
        height: 24,
        tintColor: Colors.Blue500,
    },
    placeTextContainer: {
        flex: 1,
    },
    primaryText: {
        fontSize: Fonts.size._16px,
        fontFamily: Fonts.name.medium,
        color: Colors.Defaultblack,
        marginBottom: 4,
    },
    fullText: {
        fontSize: Fonts.size._14px,
        fontFamily: Fonts.name.regular,
        color: Colors.BlackColor600,
    },
    chevronIcon: {
        width: 16,
        height: 16,
        tintColor: Colors.BlackColor500,
    },
    testButton: {
        backgroundColor: Colors.Blue500,
        padding: 12,
        marginVertical: 16,
        borderRadius: 8,
        alignSelf: 'center',
    },
    testButtonText: {
        color: Colors.Defaultwhite,
        fontFamily: Fonts.name.medium,
        fontSize: Fonts.size._14px,
    },
    separator: {
        height: 1,
        backgroundColor: Colors.BlackColor200,
    },
    debugInfo: {
        padding: 8,
        backgroundColor: Colors.BlackColor100,
    },
    debugText: {
        fontSize: Fonts.size._12px,
        color: Colors.Defaultblack,
        textAlign: 'center',
    },
    flatList: {
        flex: 1,
        width: '100%',
        height: '80%',
    },
    scrollView: {
        flex: 1,
        width: '100%',
    },
})

export default SearchLocation