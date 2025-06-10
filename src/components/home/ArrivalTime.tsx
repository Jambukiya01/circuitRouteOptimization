import React, { useState } from 'react'
import { View } from 'native-base';
import { ArrivalTimeType } from '../../model/LocationModel';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Colors, Fonts, Utils } from '../../constants';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useTheme } from '../../context/ThemeContext';

interface ArrivalTimeProps {
    initialData?: ArrivalTimeType;
    onSave: (data: ArrivalTimeType) => void;
    onClose: () => void;
}
const ArrivalTime: React.FC<ArrivalTimeProps> = ({
    initialData,
    onSave,
    onClose,
}) => {
    const { theme, setTheme, isDarkMode } = useTheme();
    const [fromTime, setFromTime] = useState<string | null>(initialData?.from || null);
    const [toTime, setToTime] = useState<string | null>(initialData?.to || null);
    const [selectedTimeId, setSelectedTimeId] = useState<number>(0);
    const handleClear = () => {
        onSave({});
    };

    const handleDone = () => {
        const data: ArrivalTimeType = {
            ...(fromTime && { from: fromTime }),
            ...(toTime && { to: toTime })
        }
        onSave(data);
        onClose();
    }
    const handleTimeSelect = (date: Date) => {
        console.log(date);

        if (selectedTimeId === 1) {
            setFromTime(date.toISOString());
        } else if (selectedTimeId === 2) {
            setToTime(date.toISOString());
        }
        setSelectedTimeId(0);
    }
    const openTimePicker = (id: number) => {
        setSelectedTimeId(id);
    }
    return (
        <View style={[styles.container, { backgroundColor: Colors.Background(isDarkMode) }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleClear}>
                    <Text style={[styles.clearText, { color: Colors.TextSecondary(isDarkMode) }]}>Clear</Text>
                </TouchableOpacity>
                <Text style={[styles.title, { color: Colors.Text(isDarkMode) }]}>Arrival time</Text>
                <TouchableOpacity onPress={handleDone}>
                    <Text style={styles.doneText}>Done</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.row}>
                <Text style={[styles.sectionTitle, { color: Colors.TextSecondary(isDarkMode) }]}>Arrive between</Text>
                <TouchableOpacity style={[styles.selectionButton, { backgroundColor: Colors.BackgroundSecondary(isDarkMode), borderColor: Colors.Border(isDarkMode) }]} onPress={() => openTimePicker(1)}>
                    <Text style={[styles.selectionText, { color: Colors.Text(isDarkMode) }]}>{fromTime ? Utils.formatTime(fromTime) : 'Now'}</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.row}>
                <Text style={[styles.sectionTitle, { color: Colors.TextSecondary(isDarkMode) }]}>And</Text>
                <TouchableOpacity style={[styles.selectionButton, { backgroundColor: Colors.BackgroundSecondary(isDarkMode), borderColor: Colors.Border(isDarkMode) }]} onPress={() => openTimePicker(2)}>
                    <Text style={[styles.selectionText, { color: Colors.Text(isDarkMode) }]}>{toTime ? Utils.formatTime(toTime) : 'Any time'}</Text>
                </TouchableOpacity>
            </View>
            <DateTimePickerModal
                isVisible={selectedTimeId !== 0}
                mode="time"
                onConfirm={handleTimeSelect}
                onCancel={() => setSelectedTimeId(0)}
            />
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.Defaultwhite,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 16,
        fontFamily: Fonts.name.medium,
        color: Colors.Defaultblack,
    },
    clearText: {
        fontSize: 16,
        fontFamily: Fonts.name.regular,
        color: Colors.BlackColor500,
    },
    doneText: {
        fontSize: 16,
        fontFamily: Fonts.name.medium,
        color: Colors.Blue500,
    },
    sectionTitle: {
        fontSize: 14,
        fontFamily: Fonts.name.regular,
        color: Colors.BlackColor600,
        marginBottom: 12,
    },
    row: {
        flexDirection: 'column',
        marginBottom: 12,
        gap: 8,
    },
    selectionButton: {
        height: 50,
        // flex: 1,
        backgroundColor: Colors.Defaultwhite,
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: Colors.Blue500,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    selectionText: {
        fontSize: 14,
        fontFamily: Fonts.name.regular,
        color: Colors.BlackColor700,
    },
});
export default ArrivalTime;