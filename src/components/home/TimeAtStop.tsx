import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { TimeAtStopType } from '../../model/LocationModel';
import { Utils } from '../../constants';
import { Fonts } from '../../constants';
import { Colors } from '../../constants';
import { useTheme } from '../../context/ThemeContext';
import { store } from '../../App';
interface TimeAtStopProps {
    initialData?: TimeAtStopType;
    onSave: (data: TimeAtStopType) => void;
    onClose?: () => void;
}

const TimeAtStop: React.FC<TimeAtStopProps> = ({ initialData, onSave, onClose }) => {
    const session = store.getState()?.session;
    const { theme, setTheme, isDarkMode } = useTheme();
    const [minutes, setMinutes] = useState(initialData?.minutes || null);
    const [seconds, setSeconds] = useState(initialData?.seconds || null);

    // Track focus state for styling
    const [isMinutesFocused, setIsMinutesFocused] = useState(false);
    const [isSecondsFocused, setIsSecondsFocused] = useState(false);

    const handleClear = () => {
        onSave({});
        onClose?.();
    };

    const handleDone = () => {
        const data: TimeAtStopType = {
            ...(minutes && { minutes }),
            ...(seconds && { seconds })
        };
        if (minutes !== 1 && seconds !== 0) {
            onSave(data);
        } else {
            onSave({});
        }
        onClose?.();
    };

    return (
        <View style={[styles.container, { backgroundColor: Colors.Background(isDarkMode) }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleClear}>
                    <Text style={[styles.clearText, { color: Colors.TextSecondary(isDarkMode) }]}>Clear</Text>
                </TouchableOpacity>
                <Text style={[styles.title, { color: Colors.Text(isDarkMode) }]}>time at stop</Text>
                <TouchableOpacity onPress={handleDone}>
                    <Text style={styles.doneText}>Done</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.row}>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.sectionTitle, { color: Colors.TextSecondary(isDarkMode) }]}>Minutes</Text>
                    <View
                        style={[
                            styles.selectionButton,
                            {
                                borderColor: isMinutesFocused ? Colors.Blue500 : Colors.Border(isDarkMode),
                                backgroundColor: Colors.BackgroundSecondary(isDarkMode)
                            }
                        ]}
                    >
                        <TextInput
                            autoFocus
                            style={[
                                styles.selectionInput,
                                { color: isMinutesFocused ? Colors.Blue500 : Colors.Text(isDarkMode), backgroundColor: Colors.BackgroundSecondary(isDarkMode) }
                            ]}
                            value={minutes?.toString() || ''}
                            onFocus={() => setIsMinutesFocused(true)}
                            onBlur={() => setIsMinutesFocused(false)}
                            onChangeText={(text) => {
                                let value = parseInt(text) || 0;
                                if (value > 99) value = 99;
                                setMinutes(value);
                            }}
                            placeholder={session?.preferences?.averageTimeAtStop?.minutes?.toString() || "1"}
                            keyboardType="numeric"
                            placeholderTextColor={Colors.TextSecondary(isDarkMode)}
                        />
                    </View>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.sectionTitle, { color: Colors.TextSecondary(isDarkMode) }]}>Seconds</Text>
                    <View
                        style={[
                            styles.selectionButton,
                            {
                                borderColor: isSecondsFocused ? Colors.Blue500 : Colors.Border(isDarkMode),
                                backgroundColor: Colors.BackgroundSecondary(isDarkMode)
                            }
                        ]}
                    >
                        <TextInput
                            style={[
                                styles.selectionInput,
                                { color: isSecondsFocused ? Colors.Blue500 : Colors.Text(isDarkMode), backgroundColor: Colors.BackgroundSecondary(isDarkMode) }
                            ]}
                            value={seconds?.toString() || ''}
                            onFocus={() => setIsSecondsFocused(true)}
                            onBlur={() => setIsSecondsFocused(false)}
                            onChangeText={(text) => {
                                let value = parseInt(text) || 0;
                                if (value > 59) value = 59;
                                setSeconds(value);
                            }}
                            placeholder={session?.preferences?.averageTimeAtStop?.seconds?.toString() || "0"}
                            keyboardType="numeric"
                            placeholderTextColor={Colors.TextSecondary(isDarkMode)}
                        />
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.Defaultwhite,
        paddingHorizontal: 16,
        paddingBottom: 10,
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
        flexDirection: 'row',
        marginBottom: 12,
        gap: 8,
    },
    selectionButton: {
        height: 60,
        backgroundColor: Colors.Defaultwhite,
        borderRadius: 8,
        paddingHorizontal: 11,
        borderWidth: 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    selectionInput: {
        width: '100%',
        height: '100%',
        backgroundColor: Colors.Defaultwhite,
        alignItems: 'flex-start',
        justifyContent: 'center',
        fontSize: 16,
        fontFamily: Fonts.name.medium,
    }
});

export default TimeAtStop;
