import React, { useState, useEffect } from 'react'
import { WarpperComponent } from '../common';
import { BaseProps, Utils } from '../../constants';
import BreakSetupUI from './BreakSetupUI';
import { goBack } from '../../navigation/RootNavigation';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import BottomAlertDialog from '../common/BottomAlertDialog';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Colors, Fonts } from '../../constants';
import { useTheme } from '../../context/ThemeContext';

const MAX_BREAK_DURATION = 120; // 2 hours in minutes

const BreakSetup: React.FC<BaseProps> = ({ session, setSession, route }) => {
    const { isDarkMode } = useTheme();
    // Create default initial times
    const initialStartTime = new Date();
    initialStartTime.setHours(8, 0, 0, 0);

    const initialEndTime = new Date();
    initialEndTime.setHours(10, 0, 0, 0); // Set initial end time to 2 hours after start

    // Get existing break settings from session if available
    const existingBreakSetup = session?.current_route_trip?.extraCricuitData?.breakSetup;

    // Initialize state with existing values from session or defaults
    const [startTime, setStartTime] = useState<Date>(
        existingBreakSetup?.startTime ? new Date(existingBreakSetup.startTime) : initialStartTime
    );
    const [endTime, setEndTime] = useState<Date>(
        existingBreakSetup?.endTime ? new Date(existingBreakSetup.endTime) : initialEndTime
    );
    const [duration, setDuration] = useState(existingBreakSetup?.duration || '2 hours');
    const [isStartTimePickerVisible, setStartTimePickerVisible] = useState(false);
    const [isEndTimePickerVisible, setEndTimePickerVisible] = useState(false);
    const [showDurationPicker, setShowDurationPicker] = useState(false);

    const durations = [
        { label: '15 mins', minutes: 15 },
        { label: '30 mins', minutes: 30 },
        { label: '45 mins', minutes: 45 },
        { label: '1 hour', minutes: 60 },
        { label: '1.5 hours', minutes: 90 },
        { label: '2 hours', minutes: 120 }
    ];

    // Load existing break data when component mounts or session changes
    useEffect(() => {
        if (existingBreakSetup) {
            console.log('Loading existing break setup:', existingBreakSetup);

            // Convert string dates to Date objects if needed
            if (existingBreakSetup.startTime) {
                const startTimeDate = new Date(existingBreakSetup.startTime);
                if (!isNaN(startTimeDate.getTime())) {
                    setStartTime(startTimeDate);
                }
            }

            if (existingBreakSetup.endTime) {
                const endTimeDate = new Date(existingBreakSetup.endTime);
                if (!isNaN(endTimeDate.getTime())) {
                    setEndTime(endTimeDate);
                }
            }

            if (existingBreakSetup.duration) {
                setDuration(existingBreakSetup.duration);
            }
        }
    }, [session?.current_route_trip?.extraCricuitData?.breakSetup]);

    const getDurationInMinutes = (start: Date, end: Date): number => {
        return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    };

    // Calculate duration when start or end time changes
    useEffect(() => {
        const diffInMinutes = getDurationInMinutes(startTime, endTime);
        const closestDuration = durations.reduce((prev, curr) => {
            return Math.abs(curr.minutes - diffInMinutes) < Math.abs(prev.minutes - diffInMinutes) ? curr : prev;
        });
        setDuration(closestDuration.label);
    }, [startTime, endTime]);

    const handleStartTimeConfirm = (date: Date) => {
        setStartTimePickerVisible(false);

        const proposedEndTime = new Date(endTime);
        const durationInMinutes = getDurationInMinutes(date, proposedEndTime);

        if (durationInMinutes > MAX_BREAK_DURATION) {
            // If duration would exceed 2 hours, adjust end time
            const newEndTime = new Date(date);
            newEndTime.setMinutes(newEndTime.getMinutes() + MAX_BREAK_DURATION);
            setEndTime(newEndTime);
            Alert.alert('Break Duration Limited', 'Break duration cannot exceed 2 hours. End time has been adjusted.');
        } else if (durationInMinutes < 0) {
            // If end time would be before start time, adjust end time
            const newEndTime = new Date(date);
            const currentDurationMinutes = durations.find(d => d.label === duration)?.minutes || 30;
            newEndTime.setMinutes(newEndTime.getMinutes() + Math.min(currentDurationMinutes, MAX_BREAK_DURATION));
            setEndTime(newEndTime);
        }

        setStartTime(date);
    };

    const handleEndTimeConfirm = (date: Date) => {
        setEndTimePickerVisible(false);

        const durationInMinutes = getDurationInMinutes(startTime, date);

        if (durationInMinutes > MAX_BREAK_DURATION) {
            // If duration would exceed 2 hours, keep previous end time
            Alert.alert('Invalid Break Duration', 'Break duration cannot exceed 2 hours. Please select a time within 2 hours of the start time.');
            return;
        } else if (durationInMinutes < 0) {
            // If end time would be before start time, adjust start time
            const newStartTime = new Date(date);
            newStartTime.setMinutes(newStartTime.getMinutes() - Math.min(durations[0].minutes, MAX_BREAK_DURATION));
            setStartTime(newStartTime);
        }

        setEndTime(date);
    };

    const handleTimePickerCancel = () => {
        setStartTimePickerVisible(false);
        setEndTimePickerVisible(false);
    };

    const handleDurationSelect = (selectedDuration: { label: string, minutes: number }) => {
        setDuration(selectedDuration.label);
        setShowDurationPicker(false);

        // Adjust end time based on new duration
        const newEndTime = new Date(startTime);
        newEndTime.setMinutes(newEndTime.getMinutes() + selectedDuration.minutes);
        setEndTime(newEndTime);
    };

    const renderDurationPicker = () => {
        return (
            <View style={styles.durationPicker}>
                <Text style={[styles.durationTitle, { color: Colors.Text(isDarkMode) }]}>Break duration</Text>
                {durations.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.durationItem, { borderBottomColor: Colors.Border(isDarkMode) }]}
                        onPress={() => handleDurationSelect(item)}
                    >
                        <Text style={[styles.durationText, { color: Colors.TextSecondary(isDarkMode) }]}>{item.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    const handleDone = () => {
        // Save break details to session
        const breakSetupData = {
            startTime: startTime,
            endTime: endTime,
            duration: duration,
        }
        route.params?.onDone(breakSetupData);
        goBack();
    };

    const handleRemoveBreak = () => {
        // Remove break from session
        route.params?.onDone(null);
        goBack();
    };

    return (
        <>
            <BreakSetupUI
                startTime={Utils.formatTime(startTime)}
                endTime={Utils.formatTime(endTime)}
                duration={duration}
                onStartTimePress={() => setStartTimePickerVisible(true)}
                onEndTimePress={() => setEndTimePickerVisible(true)}
                onDurationPress={() => setShowDurationPicker(true)}
                onRemoveBreak={handleRemoveBreak}
                onDone={handleDone}
            />

            <DateTimePickerModal
                isVisible={isStartTimePickerVisible}
                mode="time"
                onConfirm={handleStartTimeConfirm}
                onCancel={handleTimePickerCancel}
                date={startTime}
            />

            <DateTimePickerModal
                isVisible={isEndTimePickerVisible}
                mode="time"
                onConfirm={handleEndTimeConfirm}
                onCancel={handleTimePickerCancel}
                date={endTime}
            />

            <BottomAlertDialog
                visible={showDurationPicker}
                onDismiss={() => setShowDurationPicker(false)}
                cancelable={true}
                extraView={renderDurationPicker()}
            />
        </>
    );
};

const styles = StyleSheet.create({
    durationPicker: {
        padding: 16,
    },
    durationTitle: {
        fontSize: 18,
        fontFamily: Fonts.name.bold,
        color: Colors.BlackColor900,
        marginBottom: 16,
    },
    durationItem: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.BlackColor100,
    },
    durationText: {
        fontSize: 16,
        fontFamily: Fonts.name.regular,
        color: Colors.BlackColor900,
    },
});

export default WarpperComponent(BreakSetup);
