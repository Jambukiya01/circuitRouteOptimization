import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Colors, Fonts, Images, Utils } from '../../constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { goBack } from '../../navigation/RootNavigation';
import { Place } from '../../model/LocationModel';
import LottieView from 'lottie-react-native';
import { useTheme } from '../../context/ThemeContext';
interface RouteDetailsUIProps {
    handleDone?: () => void;
    onSaveAsDefault?: (checked: boolean) => void;
    onSelectStartLocation?: () => void;
    onSelectEndLocation?: () => void;
    onSelectStartTime?: () => void;
    onClearStartTime?: () => void;
    onSelectEndTime?: () => void;
    onClearEndTime?: () => void;
    onSelectRoundTrip?: () => void;
    onAddBreak?: () => void;
    startTime?: string;
    endTime?: string;
    startLocation?: Place;
    endLocation?: Place;
    breakSetup?: any;
}

const RouteDetailsUI: React.FC<RouteDetailsUIProps> = ({
    handleDone,
    onSaveAsDefault,
    onSelectStartLocation,
    onSelectStartTime,
    onClearStartTime,
    onSelectEndTime,
    onClearEndTime,
    onSelectRoundTrip,
    onAddBreak,
    startTime,
    endTime,
    onSelectEndLocation,
    startLocation,
    endLocation,
    breakSetup
}) => {
    const [saveAsDefault, setSaveAsDefault] = useState(false);
    const { isDarkMode } = useTheme();
    const handleToggleSaveAsDefault = () => {
        const newValue = !saveAsDefault;
        setSaveAsDefault(newValue);
        onSaveAsDefault?.(newValue);
    };

    return (
        <View style={[styles.container, { backgroundColor: Colors.Background(isDarkMode) }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: Colors.Border(isDarkMode) }]}>
                <TouchableOpacity onPress={() => goBack()} style={styles.closeButton}>
                    <Image source={Images.ic_back} style={[styles.closeIcon, { tintColor: Colors.Text(isDarkMode) }]} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: Colors.Text(isDarkMode) }]}>Route details</Text>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {/* Start Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: Colors.Text(isDarkMode) }]}>Start</Text>
                    <TouchableOpacity
                        style={[styles.optionButton, { borderBottomColor: Colors.Border(isDarkMode) }]}
                        onPress={onSelectStartLocation}
                    >
                        <Image source={Images.ic_round_trip} style={styles.optionIcon} />
                        <View style={styles.optionTextContainer}>
                            <Text style={[styles.optionText, { color: Colors.Text(isDarkMode) }]}>{startLocation?.title || "Start from current location"}</Text>
                            <Text style={[styles.optionSubtext, { color: Colors.TextSecondary(isDarkMode) }]}>{startLocation?.subtitle || "Use GPS position when optimizing"}</Text>
                        </View>
                        <Image source={Images.ic_chevron_right} style={[styles.chevronIcon, { tintColor: Colors.TextSecondary(isDarkMode) }]} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.optionButton, { borderBottomColor: Colors.Border(isDarkMode) }]}
                        onPress={onSelectStartTime}
                    >
                        <View style={styles.saveDefaultContainer}>
                            {/* <Image source={Images.ic_time} style={styles.optionIcon} /> */}
                            <LottieView source={Images.Delivery_Time}
                                autoPlay
                                loop
                                style={styles.optionIcon} />
                            <Text style={[styles.optionText, { color: Colors.Text(isDarkMode) }]}>{startTime ? Utils.formatTime(startTime) : "Set start time"}</Text>
                        </View>
                        <Image source={Images.ic_chevron_right} style={[styles.chevronIcon, { tintColor: Colors.TextSecondary(isDarkMode) }]} />
                    </TouchableOpacity>
                </View>

                {/* End Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: Colors.Text(isDarkMode) }]}>End</Text>
                    <TouchableOpacity
                        style={[styles.optionButton, { borderBottomColor: Colors.Border(isDarkMode) }]}
                        onPress={onSelectEndLocation}
                    >
                        <Image source={Images.ic_round_trip} style={styles.optionIcon} />
                        <View style={styles.optionTextContainer}>
                            <Text style={[styles.optionText, { color: Colors.Text(isDarkMode) }]}>{endLocation?.title}</Text>
                            <Text style={[styles.optionSubtext, { color: Colors.TextSecondary(isDarkMode) }]}>{endLocation?.subtitle}</Text>
                        </View>
                        <Image source={Images.ic_chevron_right} style={[styles.chevronIcon, { tintColor: Colors.TextSecondary(isDarkMode) }]} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.optionButton, { borderBottomColor: Colors.Border(isDarkMode) }]}
                        onPress={onSelectEndTime}
                    >
                        <View style={styles.saveDefaultContainer}>
                            {/* <Image source={Images.ic_time} style={styles.optionIcon} /> */}
                            <LottieView source={Images.Delivery_Time}
                                autoPlay
                                loop
                                style={styles.optionIcon} />
                            <Text style={[styles.optionText, { color: Colors.Text(isDarkMode) }]}>{endTime ? Utils.formatTime(endTime) : "Set end time"}</Text>
                        </View>
                        <Image source={Images.ic_chevron_right} style={[styles.chevronIcon, { tintColor: Colors.TextSecondary(isDarkMode) }]} />
                    </TouchableOpacity>
                </View>

                {/* Break Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: Colors.Text(isDarkMode) }]}>Break</Text>
                    {!breakSetup ? <TouchableOpacity
                        style={[styles.optionButton, { borderBottomColor: Colors.Border(isDarkMode) }]}
                        onPress={onAddBreak}
                    >
                        <View style={styles.saveDefaultContainer}>
                            <LottieView source={Images.Break_Time}
                                autoPlay
                                loop
                                style={styles.optionIcon} />
                            {/* <Image source={Images.ic_break} style={styles.optionIcon} /> */}
                            <Text style={[styles.optionText, { color: Colors.Text(isDarkMode) }]}>Add a break</Text>
                        </View>
                        <Image source={Images.ic_chevron_right} style={[styles.chevronIcon, { tintColor: Colors.TextSecondary(isDarkMode) }]} />
                    </TouchableOpacity> :
                        <TouchableOpacity
                            style={[styles.optionButton, { borderBottomColor: Colors.Border(isDarkMode) }]}
                            onPress={onAddBreak}
                        >
                            <Image source={Images.ic_round_trip} style={styles.optionIcon} />
                            <View style={styles.optionTextContainer}>
                                <Text style={[styles.optionText, { color: Colors.Text(isDarkMode) }]}>{breakSetup?.duration + " break"}</Text>
                                <Text style={[styles.optionSubtext, { color: Colors.TextSecondary(isDarkMode) }]}>{"Between " + Utils.formatTime(breakSetup?.startTime) + " - " + Utils.formatTime(breakSetup?.endTime)}</Text>
                            </View>
                            <Image source={Images.ic_chevron_right} style={[styles.chevronIcon, { tintColor: Colors.TextSecondary(isDarkMode) }]} />
                        </TouchableOpacity>}
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.doneButton}
                    onPress={handleDone}
                >
                    <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.saveDefaultContainer}
                    onPress={handleToggleSaveAsDefault}
                >
                    <Image
                        source={saveAsDefault ? Images.ic_checkbox_checked : Images.ic_checkbox_unchecked}
                        style={[styles.checkboxIcon, { tintColor: Colors.Text(isDarkMode) }]}
                    />
                    <Text style={[styles.saveDefaultText, { color: Colors.Text(isDarkMode) }]}>Save as default</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.Defaultwhite,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.BlackColor100,
    },
    closeButton: {
        padding: 8,
    },
    closeIcon: {
        width: 24,
        height: 24,
        tintColor: Colors.BlackColor700,
    },
    title: {
        flex: 1,
        fontSize: 18,
        fontFamily: Fonts.name.bold,
        color: Colors.BlackColor900,
        marginLeft: 8,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: Fonts.name.medium,
        color: Colors.BlackColor700,
        marginBottom: 12,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: Colors.BlackColor100,
    },
    optionIcon: {
        width: 27,
        height: 27,
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
    chevronIcon: {
        width: 20,
        height: 20,
        tintColor: Colors.BlackColor500,
    },
    timeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.BlackColor50,
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
        marginBottom: 8,
    },
    timeIcon: {
        width: 20,
        height: 20,
        marginRight: 12,
        tintColor: Colors.Blue500,
    },
    timeText: {
        flex: 1,
        fontSize: 16,
        fontFamily: Fonts.name.regular,
        color: Colors.BlackColor900,
    },
    clearButton: {
        padding: 4,
    },
    clearIcon: {
        width: 16,
        height: 16,
        tintColor: Colors.BlackColor500,
    },
    footer: {
        padding: 16,
    },
    doneButton: {
        backgroundColor: Colors.Blue500,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 16,
    },
    doneButtonText: {
        fontSize: 16,
        fontFamily: Fonts.name.medium,
        color: Colors.Defaultwhite,
    },
    saveDefaultContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxIcon: {
        width: 24,
        height: 24,
        marginRight: 8,
    },
    saveDefaultText: {
        fontSize: 16,
        fontFamily: Fonts.name.regular,
        color: Colors.BlackColor900,
    },
});

export default RouteDetailsUI;