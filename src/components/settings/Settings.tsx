import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, Image, Modal, TouchableWithoutFeedback, StatusBar } from 'react-native'
import React, { useEffect } from 'react'
import { WarpperComponent } from '../common'
import { BaseProps, Colors, Fonts, Images } from '../../constants'
import { goBack, reset } from '../../navigation/RootNavigation'
import TimeAtStop from '../home/TimeAtStop'
import { TimeAtStopType } from '../../model/LocationModel'
import Utils from '../../constants/Utils'
import { useTheme } from '../../context/ThemeContext'

interface SettingsPreferences {
    navigationApp: string;
    stopSide: string;
    averageTimeAtStop: TimeAtStopType;
    vehicleType: string;
    avoidTolls: boolean;
    packageId: boolean;
    navigationModeBubble: boolean;
    distanceUnit: string;
    theme: string;
}

const defaultPreferences = {
    navigationApp: {
        title: 'Navigation app',
        options: [
            { id: 1, title: 'Google Maps' },
            { id: 2, title: 'Waze' },
            { id: 3, title: 'Yandex Navigator' },
            { id: 4, title: 'Apple Maps' },
            { id: 5, title: 'Here WeGo' },
            { id: 6, title: 'Navigon' },
            { id: 7, title: 'TomTom' }
        ]
    },
    stopSide: {
        title: 'Stop side',
        options: [
            { id: 1, title: 'Any side of vehicle' },
            { id: 2, title: 'Left only' },
            { id: 3, title: 'Right only' },
        ]
    },
    averageTimeAtStop: {
        title: 'Average time at stop',
        options: [
            { id: 1, title: '1 min' },
            { id: 2, title: '2 min' },
        ]
    },
    vehicleType: {
        title: 'Vehicle type',
        options: [
            { id: 1, title: 'Bicycle' },
            { id: 2, title: 'Scooter' },
            { id: 3, title: 'Car' },
            { id: 4, title: 'Small truck' },
            { id: 5, title: 'Large truck' },
        ]
    },
    distanceUnit: {
        title: 'Distance unit',
        options: [
            { id: 1, title: 'Kilometers' },
            { id: 2, title: 'Miles' },
        ]
    },
    theme: {
        title: 'Theme',
        options: [
            { id: 1, title: 'Light' },
            { id: 2, title: 'Dark' },
            { id: 3, title: 'Follow system' },
        ]
    },
}

const Settings: React.FC<BaseProps> = ({ navigation, session, setSession }) => {
    const { theme, setTheme, isDarkMode } = useTheme();

    const [preferences, setPreferences] = React.useState<SettingsPreferences>({
        navigationApp: session?.preferences?.navigationApp || 'Google Maps',
        stopSide: session?.preferences?.stopSide || 'Any side of vehicle',
        averageTimeAtStop: session?.preferences?.averageTimeAtStop || { minutes: 1, seconds: 0 },
        vehicleType: session?.preferences?.vehicleType || 'Car',
        avoidTolls: session?.preferences?.avoidTolls || false,
        packageId: session?.preferences?.packageId || false,
        navigationModeBubble: session?.preferences?.navigationModeBubble || false,
        distanceUnit: session?.preferences?.distanceUnit || 'Kilometers',
        theme: session?.preferences?.theme || 'Light'
    });
    const [showSelectOption, setShowSelectOption] = React.useState(false);
    const [selectedSetting, setSelectedSetting] = React.useState<keyof typeof defaultPreferences | null>(null);

    const updatePreference = (key: keyof SettingsPreferences, value: any) => {
        const newPreferences = { ...preferences, [key]: value };
        setPreferences(newPreferences);
        setSession('preferences', newPreferences);
        if (key === 'theme') {
            setTheme(value);
        }
    };

    const renderHeader = () => (
        <View style={[styles.header, { backgroundColor: Colors.Background(isDarkMode), borderBottomColor: Colors.Border(isDarkMode) }]}>
            <TouchableOpacity onPress={() => goBack()} style={styles.backButton}>
                <Image source={Images.ic_back} style={[styles.backIcon, { tintColor: Colors.Text(isDarkMode) }]} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: Colors.Text(isDarkMode) }]}>Settings</Text>
        </View>
    );

    const renderSectionHeader = (title: string) => (
        <Text style={[styles.sectionHeader, { backgroundColor: Colors.Background(isDarkMode) }]}>{title}</Text>
    );

    const renderSettingItem = (
        title: string,
        subtitle?: string,
        value?: any,
        onPress?: () => void,
        isSwitch?: boolean
    ) => (
        <TouchableOpacity
            style={[styles.settingItem, { borderBottomColor: Colors.Border(isDarkMode) }]}
            onPress={onPress}
            disabled={isSwitch}
        >
            <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: Colors.Text(isDarkMode) }]}>{title}</Text>
                {subtitle && <Text style={[styles.settingSubtitle, { color: Colors.TextSecondary(isDarkMode) }]}>{subtitle}</Text>}
            </View>
            {isSwitch ? (
                <Switch
                    value={value}
                    onValueChange={onPress}
                    trackColor={{ false: Colors.TrackFalseColor(isDarkMode), true: Colors.TrackTrueColor(isDarkMode) }}
                    thumbColor={value ? Colors.TrackThumbTrueColor(isDarkMode) : Colors.TrackThumbFalseColor(isDarkMode)}
                />
            ) : (
                <Text style={[styles.settingValue, { color: Colors.TextSecondary(isDarkMode) }]}>{value}</Text>
            )}
        </TouchableOpacity>
    );

    const handleSelectOption = (settingKey: keyof typeof defaultPreferences) => {
        setSelectedSetting(settingKey);
        setShowSelectOption(true);
    };

    return (
        <View style={[styles.container, { backgroundColor: Colors.Background(isDarkMode) }]}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={Colors.Background(isDarkMode)} />
            {renderHeader()}
            <ScrollView style={styles.scrollView}>
                {renderSectionHeader('Route Preferences')}
                {renderSettingItem('Navigation app', undefined, preferences.navigationApp,
                    () => handleSelectOption('navigationApp'))}
                {renderSettingItem('Stop side', undefined, preferences.stopSide,
                    () => handleSelectOption('stopSide'))}
                {renderSettingItem('Average time at stop', undefined, Utils.getTimeAtStopDisplayText(preferences.averageTimeAtStop || { minutes: 1, seconds: 0 }),
                    () => handleSelectOption('averageTimeAtStop'))}
                {renderSettingItem('Vehicle type', undefined, preferences.vehicleType,
                    () => handleSelectOption('vehicleType'))}
                {renderSettingItem('Avoid tolls', 'Save costs by avoiding toll roads', preferences.avoidTolls,
                    () => updatePreference('avoidTolls', !preferences.avoidTolls), true)}
                {renderSettingItem('Package ID', 'Adds a unique ID to every delivery', preferences.packageId,
                    () => updatePreference('packageId', !preferences.packageId), true)}
                {renderSettingItem('Navigation mode bubble', 'See delivery info while navigating', preferences.navigationModeBubble,
                    () => updatePreference('navigationModeBubble', !preferences.navigationModeBubble), true)}

                {renderSectionHeader('General Preferences')}
                {renderSettingItem('Distance unit', undefined, preferences.distanceUnit,
                    () => handleSelectOption('distanceUnit'))}
                {renderSettingItem('Theme', undefined, preferences.theme,
                    () => handleSelectOption('theme'))}

                {renderSectionHeader('Subscription')}
                {renderSettingItem('Compare plans', undefined, undefined)}
                {renderSettingItem('Licenses', undefined, undefined)}
                {renderSettingItem('Terms of use', undefined, undefined)}
                {renderSettingItem('Privacy policy', undefined, undefined)}
                {renderSettingItem('Version', undefined, 'Circuit-v3.42.1')}

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={() => {
                        setSession('isLoggedIn', false);
                        reset('LoginOptions');
                    }}
                >
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
                <Modal
                    visible={showSelectOption}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowSelectOption(false)}
                >
                    <TouchableWithoutFeedback onPress={() => setShowSelectOption(false)}>
                        <View style={styles.modalOverlay}>
                            <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
                                <View style={[styles.modalContent, { backgroundColor: Colors.Background(isDarkMode) }]}>
                                    {selectedSetting == 'averageTimeAtStop' ? (
                                        <TimeAtStop
                                            initialData={preferences.averageTimeAtStop || undefined}
                                            onSave={(data) => {
                                                console.log("data", data);
                                                updatePreference(selectedSetting, data);
                                                setShowSelectOption(false);
                                            }}
                                        />
                                    ) : (
                                        <>
                                            <Text style={[styles.modalTitle, { color: Colors.Text(isDarkMode) }]}>
                                                {selectedSetting ? defaultPreferences[selectedSetting].title : ''}
                                            </Text>
                                            <ScrollView>
                                                {selectedSetting && defaultPreferences[selectedSetting].options.map(option => (
                                                    <TouchableOpacity
                                                        key={option.id}
                                                        style={[styles.optionItem, { borderBottomColor: Colors.Border(isDarkMode) }]}
                                                        onPress={() => {
                                                            updatePreference(selectedSetting, option.title);
                                                            setShowSelectOption(false);
                                                        }}
                                                    >
                                                        <Text style={[
                                                            styles.optionText,
                                                            { color: Colors.Text(isDarkMode) },
                                                            preferences[selectedSetting] === option.title && styles.selectedOption
                                                        ]}>{option.title}</Text>
                                                        {
                                                            preferences[selectedSetting] === option.title && (
                                                                <Image source={Images.ic_check} style={styles.checkIcon} />
                                                            )
                                                        }
                                                    </TouchableOpacity>
                                                ))}
                                            </ScrollView>
                                        </>
                                    )}
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.BlackColor200,
    },
    backButton: {
        padding: 8,
    },
    backIcon: {
        width: 24,
        height: 24,
        tintColor: Colors.BlackColor900,
    },
    headerTitle: {
        fontSize: Fonts.size._18px,
        fontFamily: Fonts.name.bold,
        color: "#f7f8f9",
        marginLeft: 8,
    },
    scrollView: {
        flex: 1,
    },
    sectionHeader: {
        fontSize: Fonts.size._14px,
        fontFamily: Fonts.name.medium,
        color: Colors.Blue500,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: Colors.BlackColor100,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.BlackColor200,
    },
    settingTextContainer: {
        flex: 1,
    },
    settingTitle: {
        fontSize: Fonts.size._16px,
        fontFamily: Fonts.name.regular,
        color: Colors.BlackColor900,
    },
    settingSubtitle: {
        fontSize: Fonts.size._14px,
        fontFamily: Fonts.name.regular,
        color: Colors.BlackColor600,
        marginTop: 4,
    },
    settingValue: {
        fontSize: Fonts.size._16px,
        fontFamily: Fonts.name.regular,
        color: Colors.BlackColor600,
        marginLeft: 8,
    },
    logoutButton: {
        padding: 16,
        marginTop: 16,
        marginBottom: 32,
    },
    logoutText: {
        fontSize: Fonts.size._16px,
        fontFamily: Fonts.name.medium,
        color: Colors.Red500,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalTitle: {
        fontSize: Fonts.size._18px,
        fontFamily: Fonts.name.bold,
        marginBottom: 16,
        textAlign: 'center',
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderBottomWidth: 1,
    },
    optionText: {
        fontSize: Fonts.size._16px,
        fontFamily: Fonts.name.regular,
    },
    selectedOption: {
        fontFamily: Fonts.name.bold,
        color: Colors.Blue500,
    },
    checkIcon: {
        width: 24,
        height: 24,
        tintColor: Colors.Blue500,
    },
})

export default WarpperComponent(Settings)
