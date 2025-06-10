import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Place } from '../../model/LocationModel';
import Fonts from '../../constants/Fonts';
import { Colors, Images } from '../../constants';

interface CustomMarkerProps {
    location?: Place;
    locationIndex?: number | string;
    isStartLocation?: boolean;
    isEndLocation?: boolean;
}

const CustomMarker: React.FC<CustomMarkerProps> = ({ location, locationIndex, isStartLocation, isEndLocation }) => {

    const displayColor = isStartLocation ? Colors.Green500 : isEndLocation ? Colors.SecondaryYellow : location?.stopType === "delivery" ? '#0022a2' : '#ff5260'
    return (
        <View style={styles.markerContainer}>
            <View style={[styles.customMarker,
            { backgroundColor: displayColor }
            ]}>
                <View style={styles.customInnerMarker}>
                    {isStartLocation || isEndLocation ?
                        <Image source={Images.ic_dot} style={[styles.ic_dot, { tintColor: displayColor }]} />
                        :
                        <Text style={[styles.markerText,
                        { color: displayColor }
                        ]}>{locationIndex || 1}</Text>
                    }
                </View>
            </View>
            <View style={[styles.markerPointer,
            { borderTopColor: displayColor }
            ]} />
        </View>
    );
};

const styles = StyleSheet.create({
    markerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    customMarker: {
        backgroundColor: '#0022a2',  // #ff5260
        width: 30,
        height: 30,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5, // For Android shadow
    },
    customInnerMarker: {
        backgroundColor: 'white',
        width: 20,
        height: 20,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
    },
    markerText: {
        fontSize: Fonts.size._16px,
        color: '#0022a2', // #ff5260
        fontFamily: Fonts.name.Heavy
    },
    markerPointer: {
        width: 0,
        height: 0,
        borderLeftWidth: 10,
        borderRightWidth: 10,
        borderTopWidth: 15,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#0022a2', // #ff5260
        marginTop: -5, // To overlap slightly with the circle
    },
    ic_dot: {
        width: 15,
        height: 15,
    }
});

export default CustomMarker;
