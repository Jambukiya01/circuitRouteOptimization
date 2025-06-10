import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors, Fonts, Images } from '../../constants';
import { goBack } from '../../navigation/RootNavigation';
import { useTheme } from '../../context/ThemeContext';

interface BreakSetupUIProps {
    startTime: string;
    endTime: string;
    duration: string;
    onStartTimePress: () => void;
    onEndTimePress: () => void;
    onDurationPress: () => void;
    onRemoveBreak: () => void;
    onDone: () => void;
}

const BreakSetupUI: React.FC<BreakSetupUIProps> = ({
    startTime,
    endTime,
    duration,
    onStartTimePress,
    onEndTimePress,
    onDurationPress,
    onRemoveBreak,
    onDone
}) => {
    const { isDarkMode } = useTheme();
    return (
        <View style={[styles.container, { backgroundColor: Colors.Background(isDarkMode) }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: Colors.Border(isDarkMode) }]}>
                <TouchableOpacity onPress={() => goBack()} style={styles.backButton}>
                    <Image source={Images.ic_back} style={[styles.backIcon, { tintColor: Colors.TextSecondary(isDarkMode) }]} />
                </TouchableOpacity>
                <View style={styles.headerTextContainer}>
                    <Text style={[styles.headerTitle, { color: Colors.Text(isDarkMode) }]}>Break setup</Text>
                    <Text style={[styles.headerSubtitle, { color: Colors.TextSecondary(isDarkMode) }]}>
                        Get more accurate stop and route time estimates{'\n'}
                        by planning your break within Circuit.
                    </Text>
                </View>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {/* Break Time Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: Colors.Text(isDarkMode) }]}>When do you want to take a break?</Text>
                    <View style={styles.timeContainer}>
                        <View style={styles.timeColumn}>
                            <Text style={[styles.timeLabel, { color: Colors.TextSecondary(isDarkMode) }]}>Between</Text>
                            <TouchableOpacity
                                style={[styles.timeButton, { backgroundColor: Colors.BackgroundSecondary(isDarkMode) }]}
                                onPress={onStartTimePress}
                            >
                                <Image source={Images.ic_time} style={[styles.timeIcon, { tintColor: Colors.Text(isDarkMode) }]} />
                                <Text style={[styles.timeText, { color: Colors.Text(isDarkMode) }]}>{startTime}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.timeColumn}>
                            <Text style={[styles.timeLabel, { color: Colors.TextSecondary(isDarkMode) }]}>End</Text>
                            <TouchableOpacity
                                style={[styles.timeButton, { backgroundColor: Colors.BackgroundSecondary(isDarkMode) }]}
                                onPress={onEndTimePress}
                            >
                                <Image source={Images.ic_time} style={[styles.timeIcon, { tintColor: Colors.Text(isDarkMode) }]} />
                                <Text style={[styles.timeText, { color: Colors.Text(isDarkMode) }]}>{endTime}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Break Duration Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: Colors.Text(isDarkMode) }]}>How long does your break last?</Text>
                    <TouchableOpacity
                        style={styles.durationButton}
                        onPress={onDurationPress}
                    >
                        <Text style={[styles.durationLabel, { color: Colors.TextSecondary(isDarkMode) }]}>Break duration</Text>
                        <View style={styles.durationContent}>
                            <Image source={Images.ic_time} style={[styles.timeIcon, { tintColor: Colors.Text(isDarkMode) }]} />
                            <Text style={[styles.timeText, { color: Colors.Text(isDarkMode) }]}>{duration}</Text>
                            <Image source={Images.ic_chevron_right} style={styles.chevronIcon} />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Footer */}
            <View style={[styles.footer, { borderTopColor: Colors.Border(isDarkMode) }]}>
                <TouchableOpacity
                    style={styles.doneButton}
                    onPress={onDone}
                >
                    <Text style={[styles.doneButtonText, { color: Colors.Text(isDarkMode) }]}>Done</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.removeButton}
                    onPress={onRemoveBreak}
                >
                    <Text style={[styles.removeButtonText]}>Remove break</Text>
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
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.BlackColor100,
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    backIcon: {
        width: 24,
        height: 24,
        tintColor: Colors.BlackColor700,
    },
    headerTextContainer: {
        marginTop: 8,
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: Fonts.name.bold,
        color: Colors.BlackColor900,
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 14,
        fontFamily: Fonts.name.regular,
        color: Colors.Blue500,
        lineHeight: 20,
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
        color: Colors.BlackColor900,
        marginBottom: 16,
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 16,
    },
    timeColumn: {
        flex: 1,
    },
    timeLabel: {
        fontSize: 14,
        fontFamily: Fonts.name.regular,
        color: Colors.BlackColor700,
        marginBottom: 8,
    },
    timeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: Colors.BlackColor50,
        borderRadius: 8,
    },
    timeIcon: {
        width: 20,
        height: 20,
        marginRight: 8,
        tintColor: Colors.Blue500,
    },
    timeText: {
        fontSize: 16,
        fontFamily: Fonts.name.regular,
        color: Colors.BlackColor900,
    },
    durationButton: {
        borderWidth: 1,
        borderColor: Colors.BlackColor100,
        borderRadius: 8,
        padding: 16,
    },
    durationLabel: {
        fontSize: 14,
        fontFamily: Fonts.name.regular,
        color: Colors.BlackColor700,
        marginBottom: 8,
    },
    durationContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    chevronIcon: {
        width: 20,
        height: 20,
        marginLeft: 'auto',
        tintColor: Colors.BlackColor500,
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: Colors.BlackColor100,
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
    removeButton: {
        alignItems: 'center',
    },
    removeButtonText: {
        fontSize: 16,
        fontFamily: Fonts.name.regular,
        color: "#e57f7a",
    },
});

export default BreakSetupUI; 