import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Switch, StyleSheet, Image } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BaseProps, Colors, Images, Utils } from '../../constants';
import { WarpperComponent } from '../common';
import { defaultRouteTripData } from '../../data/defaultData';
import { KEY_CURRENT_ROUTE_TRIP, KEY_ROUTE_TRIP_DATA } from '../../data/storeKey';
import { goBack } from '../../navigation/RootNavigation';
import { useTheme } from '../../context/ThemeContext';
const AddRouteTrip: React.FC<BaseProps> = ({ session, setSession }) => {
    const { isDarkMode } = useTheme();
    const [routeName, setRouteName] = useState('Tuesday');
    const [selectedDate, setSelectedDate] = useState(1);
    const [carryOverStops, setCarryOverStops] = useState(false);
    const [customDate, setCustomDate] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const defaultDateOptions = [
        { id: 1, label: 'Today', date: new Date().toISOString() },
        { id: 2, label: 'Tomorrow', date: new Date(Date.now() + 86400000).toISOString() },
        { id: 3, label: 'Picked Date', date: customDate }
    ];


    const handleDateSelection = (id: number) => {
        if (id === 3) {
            setShowDatePicker(true); // Open date picker
        } else {
            setSelectedDate(id);
            setCustomDate(null);
        }
    };

    const handleDatePicked = (event: any, date: any) => {

        setShowDatePicker(false);
        if (date) {
            setCustomDate(date.toISOString());
            setSelectedDate(3);
        }
    };

    const handleAddRouteTrip = () => {
        const tripId = Math.random().toString(36).substr(2, 9);
        const newRouteTripData = {
            ...defaultRouteTripData,
            routeName: routeName,
            date: defaultDateOptions[selectedDate - 1].date,
            tripId: tripId,
        }

        const updatedRouteTripData = [
            ...(session?.route_trip_data || []),
            newRouteTripData
        ];

        setSession(KEY_ROUTE_TRIP_DATA, updatedRouteTripData);
        setSession(KEY_CURRENT_ROUTE_TRIP, newRouteTripData);
        goBack();

        console.log(session.route_trip_data);
    }

    return (
        <View style={[styles.container, { backgroundColor: Colors.Background(isDarkMode) }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <TouchableOpacity onPress={() => goBack()}>
                    <Image source={Images.ic_back} style={{ tintColor: Colors.Text(isDarkMode) }} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: Colors.Text(isDarkMode) }]}>Create route</Text>
            </View>

            {/* Route Name Input */}
            <Text style={[styles.label, { color: Colors.TextSecondary(isDarkMode) }]}>Route name (optional)</Text>
            <TextInput
                style={[styles.input, { backgroundColor: Colors.Background(isDarkMode), borderColor: Colors.Border(isDarkMode), color: Colors.Text(isDarkMode) }]}
                value={routeName}
                onChangeText={setRouteName}
                placeholder="Enter route name"
                placeholderTextColor={Colors.TextSecondary(isDarkMode)}
            />

            {/* Select Date */}
            <Text style={[styles.label, { color: Colors.TextSecondary(isDarkMode) }]}>Select date</Text>
            {defaultDateOptions.map((option: any) => (
                <TouchableOpacity
                    key={option.id}
                    style={[styles.dateOption, selectedDate === option.id && styles.selectedDate, { borderColor: Colors.Border(isDarkMode), backgroundColor: selectedDate === option.id ? isDarkMode ? "#293143" : "#f1f5ff" : Colors.Background(isDarkMode) }]}
                    onPress={() => handleDateSelection(option.id)}
                >
                    <Image source={Images.ic_calendar} style={[styles.dateIcon, { tintColor: selectedDate === option.id ? Colors.Blue500 : Colors.TextSecondary(isDarkMode) }]} />
                    <Text style={[styles.dateText, { color: selectedDate === option.id ? Colors.Blue500 : Colors.TextSecondary(isDarkMode) }]}>{option.label}</Text>
                    {option.date && <Text style={[styles.dateSubText, { color: selectedDate === option.id ? Colors.Blue500 : Colors.TextSecondary(isDarkMode) }]}>{Utils.formatDate(option.date, 'DD, MMM YYYY', false)}</Text>}
                    {selectedDate === option.id && <Image source={Images.ic_radio_button_on} style={[styles.dateIcon, { tintColor: Colors.Blue500 }]} />}
                </TouchableOpacity>
            ))}

            {/* Show Date Picker */}
            {showDatePicker && (
                <DateTimePicker
                    value={new Date()}
                    mode="date"
                    display="default"
                    onChange={handleDatePicked}
                />
            )}

            {/* Quick Start Option */}
            {/* <Text style={styles.label}>Quick start options</Text>
            <TouchableOpacity style={styles.quickOption} onPress={() => setCarryOverStops(!carryOverStops)}>
                <Image source={Images.ic_location_live} style={styles.dateIcon} />
                <Text style={styles.dateText}>Pick past stops to carry over</Text>
                <Image source={carryOverStops ? Images.ic_checkbox_checked : Images.ic_checkbox_unchecked}
                    style={[styles.dateIcon, { tintColor: Colors.Blue500 }]}
                />
            </TouchableOpacity> */}

            {/* Confirm Button */}
            <View style={{ flex: 1, justifyContent: "flex-end" }}>
                <TouchableOpacity style={styles.confirmButton} onPress={handleAddRouteTrip}>
                    <Text style={styles.confirmButtonText}>Confirm</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginTop: 15,
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    dateOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        marginVertical: 5,
    },
    selectedDate: {
        borderColor: Colors.Blue500,
        backgroundColor: '#F0F8FF',
    },
    dateText: {
        fontSize: 16,
        flex: 1,
        marginLeft: 10,
    },
    dateSubText: {
        fontSize: 14,
        color: '#888',
        marginRight: 10,
    },
    quickOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        marginVertical: 5,
    },
    confirmButton: {
        backgroundColor: Colors.Blue500,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    confirmButtonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
    dateIcon: {
        width: 20,
        height: 20,
    },
});

export default WarpperComponent(AddRouteTrip);
