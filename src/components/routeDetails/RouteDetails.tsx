import React, { useEffect, useState } from 'react'
import { WarpperComponent, BottomAlertDialog } from '../common';
import { BaseProps, Utils } from '../../constants';
import RouteDetailsUI from './RouteDetailsUI';
import { goBack, navigate } from '../../navigation/RootNavigation';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Place } from '../../model/LocationModel';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Colors, Fonts, Images } from '../../constants';

const RouteDetails: React.FC<BaseProps> = ({ session, setSession, route }) => {
    // Get existing extraCricuitData from session if available
    const existingData = session?.current_route_trip?.extraCricuitData;

    // Initialize with existing values or defaults
    const [startTime, setStartTime] = useState<string>(
        existingData?.startTime || ''
    );

    const [startLocation, setStartLocation] = useState<Place>(
        existingData?.startLocation || {
            id: 1,
            title: "Start from current location",
            subtitle: "Use GPS position when optimizing",
        }
    );

    const [endTime, setEndTime] = useState<string>(
        existingData?.endTime || ''
    );

    const [endLocation, setEndLocation] = useState<Place>(
        existingData?.endLocation || {
            id: 1,
            title: "Return to start",
            subtitle: "Roundtrip (recommended)",
        }
    );

    const [isStartTimePickerVisible, setStartTimePickerVisible] = useState(false);
    const [isEndTimePickerVisible, setEndTimePickerVisible] = useState(false);
    const [showEndLocationOptions, setShowEndLocationOptions] = useState(false);
    const [breakSetup, setBreakSetup] = useState(existingData?.breakSetup || null);


    useEffect(() => {
        if (route.params?.fromBreak) {
            navigate("BreakSetup", {
                onDone: (breakSetupData: any) => {
                    setBreakSetup(breakSetupData);
                }
            })
        }
    }, [])

    const handleStartTimePicker = () => {
        setStartTimePickerVisible(true);
    };

    const handleEndTimePicker = () => {
        setEndTimePickerVisible(true);
    };

    const handleStartTimeConfirm = (date: Date) => {
        console.log("date", date.toISOString());
        setStartTimePickerVisible(false);
        if (date) {
            setStartTime(date.toISOString());
        }
    };

    const handleEndTimeConfirm = (date: Date) => {
        setEndTimePickerVisible(false);
        if (date) {
            setEndTime(date.toISOString());
        }
    };

    const handleTimePickerCancel = () => {
        setStartTimePickerVisible(false);
        setEndTimePickerVisible(false);
    };

    const handleStartLocation = () => {
        navigate("ChangeLocation", {
            onDone: (place: any) => {
                console.log("Place selected in RouteDetails:", place);
                const newPlace: Place = {
                    title: place.primary_text || '',
                    subtitle: place.full_text ? place.full_text.replace(place.primary_text + ", ", "") : '',
                    placeId: place.placeId,
                    latitude: place.latitude || 0,
                    longitude: place.longitude || 0,
                };
                setStartLocation(newPlace);
            }
        })
    }

    const handleEndLocation = () => {
        setShowEndLocationOptions(true);
    }

    const handleReturnToStart = () => {
        setShowEndLocationOptions(false);
        setEndLocation({
            id: 1,
            title: "Return to start",
            subtitle: "Roundtrip (recommended)",
        });
        // Handle return to start logic
    }

    const handleEndAtOtherAddress = () => {
        setShowEndLocationOptions(false);
        navigate("ChangeLocation", {
            onDone: (place: any) => {
                console.log("Place selected in RouteDetails:", place);
                const newPlace: Place = {
                    id: 2,
                    title: place.primary_text || '',
                    subtitle: place.full_text ? place.full_text.replace(place.primary_text + ", ", "") : '',
                    placeId: place.placeId,
                    latitude: place.latitude || 0,
                    longitude: place.longitude || 0,
                };
                setEndLocation(newPlace);
            }
        })
    }

    const handleDontUseEndLocation = () => {
        setShowEndLocationOptions(false);
        setEndLocation({
            id: 3,
            title: "Don't use end location",
            subtitle: "Not recommended for couriers",
        });
        // Handle don't use end location logic
    }

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const renderEndLocationOptions = () => {
        return (
            <View style={styles.endLocationOptions}>
                <Text style={styles.endLocationTitle}>End Trip Options</Text>
                <View style={styles.optionsList}>
                    <TouchableOpacity
                        style={styles.optionItem}
                        onPress={handleReturnToStart}
                    >
                        <Image source={Images.ic_round_trip} style={styles.optionIcon} />
                        <View style={styles.optionTextContainer}>
                            <Text style={styles.optionText}>Return to start</Text>
                            <Text style={styles.optionSubtext}>Roundtrip (recommended)</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.optionItem}
                        onPress={handleEndAtOtherAddress}
                    >
                        <Image source={Images.ic_location} style={styles.optionIcon} />
                        <View style={styles.optionTextContainer}>
                            <Text style={styles.optionText}>End at other address</Text>
                            <Text style={styles.optionSubtext}>Enter any address</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.optionItem}
                        onPress={handleDontUseEndLocation}
                    >
                        <Image source={Images.ic_close} style={styles.optionIcon} />
                        <View style={styles.optionTextContainer}>
                            <Text style={styles.optionText}>Don't use end location</Text>
                            <Text style={styles.optionSubtext}>Not recommended for couriers</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const handleAddBreak = () => {
        navigate("BreakSetup", {
            onDone: (breakSetupData: any) => {
                setBreakSetup(breakSetupData);
            }
        })
    }

    const handleDone = () => {
        const extraCricuitData = {
            startTime: startTime,
            endTime: endTime,
            startLocation: startLocation,
            endLocation: endLocation,
            breakSetup: breakSetup,
        }
        route.params?.onDone?.(extraCricuitData);
        goBack();
    };

    return (
        <>
            <RouteDetailsUI
                startTime={startTime}
                endTime={endTime}
                onSelectStartTime={handleStartTimePicker}
                onSelectEndTime={handleEndTimePicker}
                onClearStartTime={() => setStartTime('')}
                onClearEndTime={() => setEndTime('')}
                onSelectStartLocation={handleStartLocation}
                onSelectEndLocation={handleEndLocation}
                startLocation={startLocation}
                endLocation={endLocation}
                onAddBreak={handleAddBreak}
                breakSetup={breakSetup}
                handleDone={handleDone}
            />

            <DateTimePickerModal
                isVisible={isStartTimePickerVisible}
                mode="time"
                onConfirm={handleStartTimeConfirm}
                onCancel={handleTimePickerCancel}
                date={new Date()}
            />

            <DateTimePickerModal
                isVisible={isEndTimePickerVisible}
                mode="time"
                onConfirm={handleEndTimeConfirm}
                onCancel={handleTimePickerCancel}
                date={new Date()}
            />

            <BottomAlertDialog
                visible={showEndLocationOptions}
                onDismiss={() => setShowEndLocationOptions(false)}
                cancelable={true}
                extraView={renderEndLocationOptions()}
            />
        </>
    )
}

const styles = StyleSheet.create({
    endLocationOptions: {
        padding: 16,
    },
    endLocationTitle: {
        fontSize: 18,
        fontFamily: Fonts.name.bold,
        color: Colors.BlackColor900,
        marginBottom: 16,
    },
    optionsList: {
        gap: 16,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.BlackColor100,
    },
    optionIcon: {
        width: 24,
        height: 24,
        marginRight: 12,
        tintColor: Colors.Blue500,
    },
    optionTextContainer: {
        flex: 1,
    },
    optionText: {
        fontSize: 16,
        fontFamily: Fonts.name.regular,
        color: Colors.BlackColor900,
    },
    optionSubtext: {
        fontSize: 14,
        fontFamily: Fonts.name.regular,
        color: Colors.BlackColor500,
        marginTop: 2,
    },
});

export default WarpperComponent(RouteDetails);
