import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
    TextBase,
    Keyboard,
    TextInput,
} from 'react-native';
import { Colors, Fonts, Images, Utils } from '../../constants';
import LottieView from 'lottie-react-native';
import { ScrollView } from 'react-native-gesture-handler';
import BottomAlertDialog from '../common/BottomAlertDialog';
import PackageFinder from './PackageFinder';
import { ArrivalTimeType, PackageFinderData, Place, TimeAtStopType } from '../../model/LocationModel';
import ArrivalTime from './ArrivalTime';
import TimeAtStop from './TimeAtStop';
import { TextArea, ITextAreaProps } from 'native-base';
import { useTheme } from '../../context/ThemeContext';
import { store } from '../../App';
type OrderType = 'first' | 'auto' | 'last';
type StopType = 'delivery' | 'pickup';

interface LocationDetailsCardProps {
    location: Place;
    onClose?: () => void;
    onChangeAddress?: () => void;
    onDuplicateStop?: () => void;
    onRemoveStop?: () => void;
    onPackageCountChange?: (count: number) => void;
    onOrderTypeChange?: (orderType: OrderType) => void;
    onStopTypeChange?: (stopType: StopType) => void;
    onPackageFinderChange?: (data: PackageFinderData) => void;
    onArrivalTimeChange?: (data: ArrivalTimeType) => void;
    onTimeAtStopChange?: (data: TimeAtStopType) => void;
    onNotesChange?: (notes: string) => void;
    showHeader?: boolean;
}

const LocationDetailsCard: React.FC<LocationDetailsCardProps> = ({
    location,
    onClose,
    onChangeAddress,
    onDuplicateStop,
    onRemoveStop,
    onPackageCountChange,
    onOrderTypeChange,
    onStopTypeChange,
    onPackageFinderChange,
    onArrivalTimeChange,
    onTimeAtStopChange,
    onNotesChange,
    showHeader = false,
}) => {
    const { theme, setTheme, isDarkMode } = useTheme();
    const session = store.getState()?.session;

    // Initialize state from props
    const [packageCount, setPackageCount] = useState(location.packageCount || 1);
    const [orderType, setOrderType] = useState<OrderType>(location.orderType || 'auto');
    const [stopType, setStopType] = useState<StopType>(location.stopType || 'delivery');
    const [showPackageFinder, setShowPackageFinder] = useState(false);
    const [packageFinderData, setPackageFinderData] = useState<PackageFinderData | null>(location.packageFinder || null);
    const [arrivalTime, setArrivalTime] = useState<ArrivalTimeType | null>(location?.arrivalTime || null);
    const [showArrivalTime, setShowArrivalTime] = useState(false);
    const [showTimeAtStop, setShowTimeAtStop] = useState(false);
    const [timeAtStop, setTimeAtStop] = useState(location?.timeAtStop || session?.preferences?.averageTimeAtStop || null);
    const [notes, setNotes] = useState(location.locationNotes || '');
    const [previousNotes, setPreviousNotes] = useState(notes);

    // Add keyboard listener
    useEffect(() => {
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            handleKeyboardHide
        );
        const keyboardWillHideListener = Keyboard.addListener(
            'keyboardWillHide',
            handleKeyboardHide
        );

        return () => {
            keyboardDidHideListener.remove();
            keyboardWillHideListener.remove();
        };
    }, [notes]);

    const handleKeyboardHide = () => {

        if (notes !== previousNotes) {
            setPreviousNotes(notes);
            if (onNotesChange) {
                onNotesChange(notes);
            }
        }
    };

    const handleNotesChange = (text: string) => {
        setNotes(text);
    };

    const incrementCount = () => {
        const newCount = packageCount + 1;
        setPackageCount(newCount);
        if (onPackageCountChange) {
            onPackageCountChange(newCount);
        }
    };

    const decrementCount = () => {
        if (packageCount > 1) {
            const newCount = packageCount - 1;
            setPackageCount(newCount);
            if (onPackageCountChange) {
                onPackageCountChange(newCount);
            }
        }
    };

    const handleOrderTypeChange = (type: OrderType) => {
        setOrderType(type);
        if (onOrderTypeChange) {
            onOrderTypeChange(type);
        }
    };

    const handleStopTypeChange = (type: StopType) => {
        setStopType(type);
        if (onStopTypeChange) {
            onStopTypeChange(type);
        }
    };

    const getPackageFinderDisplayText = () => {

        if (!packageFinderData || Object.keys(packageFinderData).length === 0) return 'Not set';

        const positionParts = [
            packageFinderData.position?.horizontal?.[0],
            packageFinderData.position?.leftRight?.[0],
            packageFinderData.position?.heightPosition?.[0]
        ].filter(Boolean);

        return `${packageFinderData.size} ${packageFinderData.type} - ${positionParts.join(' ')}`;
    };

    const getArrivalTimeDisplayText = () => {
        if (!arrivalTime || Object.keys(arrivalTime).length === 0) return 'Not set';
        return `${Utils.formatTime(arrivalTime?.from || '')} - ${Utils.formatTime(arrivalTime?.to || '')}`;
    };

    return (
        <ScrollView showsVerticalScrollIndicator={false}>
            {showHeader && (
                <View style={styles.headerContainer}>
                    <Image source={Images.ic_Chat_Bubbles_Question} style={[styles.carIcon, { tintColor: Colors.Text(isDarkMode) }]} />
                    <Text style={[styles.headerText, { color: Colors.Text(isDarkMode) }]}>Edit Location</Text>
                    <TouchableOpacity style={[styles.doneButton, { backgroundColor: Colors.Background(isDarkMode) }]} onPress={onClose}>
                        <Text style={[styles.doneButtonText]}>Done</Text>
                    </TouchableOpacity>
                </View>
            )}
            <View style={[styles.container, { backgroundColor: Colors.Background(isDarkMode) }]}>
                {/* Header with status */}
                <View style={styles.header}>
                    <View style={styles.statusContainer}>
                        <View style={styles.blueCircle}>
                            <View style={[styles.innerCircle, { backgroundColor: Colors.Background(isDarkMode) }]} />
                        </View>
                        <Text style={[styles.statusText, { color: Colors.TextSecondary(isDarkMode) }]}>Blue</Text>
                    </View>
                    <View style={[styles.addedContainer, { backgroundColor: isDarkMode ? "#334637" : "#eef7ee" }]}>
                        <View style={styles.greenCircle}>
                            <Image source={Images.ic_check} style={styles.checkIcon} />
                        </View>
                        <Text style={styles.addedText}>Added</Text>
                    </View>
                </View>

                {/* Location title and address */}
                <Text style={[styles.locationTitle, { color: Colors.Text(isDarkMode) }]}>{location.title}</Text>
                <Text style={[styles.locationSubtitle, { color: Colors.TextSecondary(isDarkMode) }]}>{location.subtitle}</Text>

                {/* Access instructions button */}
                <TouchableOpacity style={styles.accessButton}>
                    <Text style={styles.accessButtonText}>+ Access instructions</Text>
                </TouchableOpacity>

                {/* Add notes */}
                <View style={styles.notesContainer}>
                    <TextInput
                        value={notes}
                        onChangeText={handleNotesChange}
                        placeholder="Add notes"
                        multiline
                        numberOfLines={10}
                        placeholderTextColor={Colors.TextSecondary(isDarkMode)}
                        style={[
                            styles.notesTextArea,
                            {
                                minHeight: 50,
                                color: Colors.Text(isDarkMode),
                                backgroundColor: Colors.BackgroundSecondary(isDarkMode),
                                borderColor: Colors.Border(isDarkMode)
                            }
                        ]}
                        textAlignVertical="top"
                    />
                    {/* <TouchableOpacity style={styles.cameraButton}>
                        <Image source={Images.ic_camera} style={styles.cameraIcon} />
                    </TouchableOpacity> */}
                </View>

                <View style={[styles.divider, { backgroundColor: Colors.Border(isDarkMode) }]} />

                {/* Package finder */}
                <View style={styles.settingRow}>
                    <View style={styles.settingLeft}>
                        <LottieView source={Images.IC_Package}
                            autoPlay
                            loop
                            style={styles.settingIcon} />
                        <Text style={[styles.settingText, { color: Colors.Text(isDarkMode) }]}>Package finder</Text>
                    </View>
                    <TouchableOpacity onPress={() => setShowPackageFinder(true)}>
                        <Text style={[styles.settingValue, { color: Colors.TextSecondary(isDarkMode) }]}>{getPackageFinderDisplayText()}</Text>
                    </TouchableOpacity>
                </View>

                {/* Packages */}
                <View style={styles.settingRow}>
                    <View style={styles.settingLeft}>
                        <LottieView source={Images.logistic_packages}
                            autoPlay
                            loop
                            style={styles.settingIcon} />
                        <Text style={[styles.settingText, { color: Colors.Text(isDarkMode) }]}>Packages</Text>
                    </View>
                    <View style={[styles.counterContainer, { borderColor: Colors.Border(isDarkMode) }]}>
                        <TouchableOpacity
                            style={styles.counterButton}
                            onPress={decrementCount}
                            disabled={packageCount <= 1}
                        >
                            <Text style={[
                                styles.counterButtonText,
                                { color: Colors.TextSecondary(isDarkMode) },
                                packageCount <= 1 ? styles.counterButtonDisabled : null
                            ]}>−</Text>
                        </TouchableOpacity>
                        <Text style={[styles.counterValue, { color: Colors.TextSecondary(isDarkMode) }]}>{packageCount}</Text>
                        <TouchableOpacity
                            style={styles.counterButton}
                            onPress={incrementCount}
                        >
                            <Text style={[styles.counterButtonText, { color: Colors.TextSecondary(isDarkMode) }]}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Order */}
                <View style={styles.settingRow}>
                    <View style={styles.settingLeft}>
                        <LottieView source={Images.Order}
                            autoPlay
                            loop
                            style={styles.settingIcon} />
                        <Text style={[styles.settingText, { color: Colors.Text(isDarkMode) }]}>Order</Text>
                    </View>
                    <View style={[styles.segmentedControl, { borderColor: Colors.Border(isDarkMode) }]}>
                        <TouchableOpacity
                            style={[
                                styles.segmentButton,
                                orderType === 'first' && styles.segmentButtonSelected
                            ]}
                            onPress={() => handleOrderTypeChange('first')}
                        >
                            <Text style={[
                                styles.segmentButtonText,
                                { color: Colors.TextSecondary(isDarkMode) },
                                orderType === 'first' && styles.segmentButtonTextSelected,
                            ]}>First</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.segmentButton,
                                orderType === 'auto' && styles.segmentButtonSelected
                            ]}
                            onPress={() => handleOrderTypeChange('auto')}
                        >
                            <Text style={[
                                styles.segmentButtonText,
                                { color: Colors.TextSecondary(isDarkMode) },
                                orderType === 'auto' && styles.segmentButtonTextSelected
                            ]}>Auto</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.segmentButton,
                                orderType === 'last' && styles.segmentButtonSelected
                            ]}
                            onPress={() => handleOrderTypeChange('last')}
                        >
                            <Text style={[
                                styles.segmentButtonText,
                                { color: Colors.TextSecondary(isDarkMode) },
                                orderType === 'last' && styles.segmentButtonTextSelected
                            ]}>Last</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Type */}
                <View style={styles.settingRow}>
                    <View style={styles.settingLeft}>
                        <Image source={Images.ic_type} style={styles.settingIcon} />
                        <Text style={[styles.settingText, { color: Colors.Text(isDarkMode) }]}>Type</Text>
                    </View>
                    <View style={[styles.segmentedControl, { borderColor: Colors.Border(isDarkMode) }]}>
                        <TouchableOpacity
                            style={[
                                styles.segmentButton,
                                stopType === 'delivery' && styles.segmentButtonSelected
                            ]}
                            onPress={() => handleStopTypeChange('delivery')}
                        >
                            <Text style={[
                                styles.segmentButtonText,
                                { color: Colors.TextSecondary(isDarkMode) },
                                stopType === 'delivery' && styles.segmentButtonTextSelected
                            ]}>Delivery</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.segmentButton,
                                stopType === 'pickup' && styles.segmentButtonSelected
                            ]}
                            onPress={() => handleStopTypeChange('pickup')}
                        >
                            <Text style={[
                                styles.segmentButtonText,
                                { color: Colors.TextSecondary(isDarkMode) },
                                stopType === 'pickup' && styles.segmentButtonTextSelected
                            ]}>Pickup</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Arrival time */}
                <View style={styles.settingRow}>
                    <View style={styles.settingLeft}>
                        <LottieView source={Images.Delivery_Time}
                            autoPlay
                            loop
                            style={styles.settingIcon} />
                        <Text style={[styles.settingText, { color: Colors.Text(isDarkMode) }]}>Arrival time</Text>
                    </View>
                    <TouchableOpacity onPress={() => setShowArrivalTime(true)}>
                        <Text style={[styles.settingValue, { color: Colors.TextSecondary(isDarkMode) }]}>{getArrivalTimeDisplayText()}</Text>
                    </TouchableOpacity>
                </View>

                {/* Time at stop */}
                <View style={styles.settingRow}>
                    <View style={styles.settingLeft}>
                        <LottieView source={Images.Stop_Watch}
                            autoPlay
                            loop
                            style={styles.settingIcon} />
                        <Text style={[styles.settingText, { color: Colors.Text(isDarkMode) }]}>Time at stop</Text>
                    </View>
                    <TouchableOpacity onPress={() => setShowTimeAtStop(true)}>
                        <Text style={[styles.settingValue, { color: Colors.TextSecondary(isDarkMode) }]}>{Utils.getTimeAtStopDisplayText(timeAtStop || session?.preferences?.averageTimeAtStop || { minutes: 1, seconds: 0 })}</Text>
                    </TouchableOpacity>
                </View>

                {/* Change address */}
                <TouchableOpacity style={styles.actionRow} onPress={onChangeAddress}>
                    <View style={styles.settingLeft}>
                        <LottieView source={Images.Edit_Map_Location}
                            autoPlay
                            loop
                            style={styles.settingIcon} />
                        <Text style={[styles.settingText, { color: Colors.Text(isDarkMode) }]}>Change address</Text>
                    </View>
                    <Image source={Images.ic_chevron_right} style={[styles.chevronIcon, { tintColor: Colors.TextSecondary(isDarkMode) }]} />
                </TouchableOpacity>

                {/* Duplicate stop */}
                <TouchableOpacity style={styles.actionRow} onPress={onDuplicateStop}>
                    <View style={styles.settingLeft}>
                        <LottieView source={Images.Duplicate_Tool}
                            autoPlay
                            loop
                            style={styles.settingIcon} />
                        <Text style={[styles.settingText, { color: Colors.Text(isDarkMode) }]}>Duplicate stop</Text>
                    </View>
                    <Image source={Images.ic_chevron_right} style={[styles.chevronIcon, { tintColor: Colors.TextSecondary(isDarkMode) }]} />
                </TouchableOpacity>

                {/* Remove stop */}
                <TouchableOpacity style={styles.actionRow} onPress={onRemoveStop}>
                    <View style={styles.settingLeft}>
                        <LottieView source={Images.Remove}
                            autoPlay
                            loop
                            style={styles.settingIcon} />
                        <Text style={[styles.settingText, styles.removeText]}>Remove stop</Text>
                    </View>
                    <Image source={Images.ic_chevron_right} style={[styles.chevronIcon, { tintColor: Colors.TextSecondary(isDarkMode) }]} />
                </TouchableOpacity>
            </View>
            <BottomAlertDialog
                visible={showPackageFinder}
                cancelable={true}
                extraView={
                    <PackageFinder
                        initialData={packageFinderData || undefined}
                        onSave={(data) => {
                            setPackageFinderData(data);
                            setShowPackageFinder(false);
                            if (onPackageFinderChange) {
                                onPackageFinderChange(data);
                            }
                        }}
                        onClose={() => setShowPackageFinder(false)}
                    />
                }
                onDismiss={() => setShowPackageFinder(false)}
            />
            <BottomAlertDialog
                visible={showArrivalTime}
                cancelable={true}
                extraView={
                    <ArrivalTime
                        initialData={arrivalTime || undefined}
                        onSave={(data) => {
                            setArrivalTime(data);
                            setShowArrivalTime(false);
                            if (onArrivalTimeChange) {
                                onArrivalTimeChange(data);
                            }
                        }}
                        onClose={() => setShowArrivalTime(false)}
                    />
                }
                onDismiss={() => setShowArrivalTime(false)}
            />
            <BottomAlertDialog
                visible={showTimeAtStop}
                cancelable={true}
                extraView={
                    <TimeAtStop
                        initialData={timeAtStop || session?.preferences?.averageTimeAtStop || undefined}
                        onSave={(data) => {
                            setTimeAtStop(data);
                            setShowTimeAtStop(false);
                            if (onTimeAtStopChange) {
                                onTimeAtStopChange(data);
                            }
                        }}
                        onClose={() => setShowTimeAtStop(false)}
                    />
                }
                onDismiss={() => setShowTimeAtStop(false)}
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.Defaultwhite,
        borderRadius: 12,
        padding: 16,
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.1,
        // shadowRadius: 4,
        // elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    blueCircle: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: Colors.Blue500,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    innerCircle: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.Defaultwhite,
    },
    statusText: {
        fontSize: 14,
        fontFamily: Fonts.name.medium,
        color: Colors.BlackColor700,
    },
    addedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eef7ee',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    greenCircle: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#4caf50',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 6,
    },
    checkIcon: {
        width: 10,
        height: 10,
        tintColor: Colors.Defaultwhite,
    },
    addedText: {
        fontSize: 12,
        fontFamily: Fonts.name.medium,
        color: '#4caf50',
    },
    locationTitle: {
        fontSize: 16,
        fontFamily: Fonts.name.bold,
        color: Colors.Defaultblack,
        marginBottom: 4,
    },
    locationSubtitle: {
        fontSize: 14,
        fontFamily: Fonts.name.regular,
        color: Colors.BlackColor600,
        marginBottom: 16,
    },
    accessButton: {
        marginBottom: 16,
    },
    accessButtonText: {
        fontSize: 14,
        fontFamily: Fonts.name.medium,
        color: Colors.Blue500,
    },
    notesContainer: {
        flexDirection: 'row',
        width: '100%',
        marginBottom: 16,
        gap: 8,
    },
    notesText: {
        fontSize: 14,
        fontFamily: Fonts.name.regular,
        color: Colors.BlackColor500,
    },
    notesTextArea: {
        flex: 1,
        borderWidth: 1,
        borderColor: Colors.BlackColor200,
        borderRadius: 4,
        padding: 8,
        fontSize: 15,
        fontFamily: Fonts.name.medium,
        color: Colors.Defaultblack,
        backgroundColor: Colors.Defaultwhite,
    },
    cameraButton: {
        alignSelf: 'center',
    },
    cameraIcon: {
        width: 20,
        height: 20,
        tintColor: Colors.BlackColor500,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.BlackColor200,
        marginBottom: 16,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingIcon: {
        width: 30,
        height: 30,
        marginRight: 12,
        tintColor: Colors.BlackColor700,
    },
    settingText: {
        fontSize: 14,
        fontFamily: Fonts.name.medium,
        color: Colors.Defaultblack,
    },
    settingValue: {
        fontSize: 14,
        fontFamily: Fonts.name.regular,
        color: Colors.BlackColor500,
    },
    counterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.BlackColor200,
        borderRadius: 4,
    },
    counterButton: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    counterButtonText: {
        fontSize: 16,
        color: Colors.BlackColor700,
    },
    counterButtonDisabled: {
        color: Colors.BlackColor300,
    },
    counterValue: {
        fontSize: 14,
        fontFamily: Fonts.name.medium,
        color: Colors.Defaultblack,
        minWidth: 32,
        textAlign: 'center',
    },
    segmentedControl: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: Colors.BlackColor200,
        borderRadius: 4,
        overflow: 'hidden',
    },
    segmentButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    segmentButtonSelected: {
        backgroundColor: Colors.Blue500,
    },
    segmentButtonText: {
        fontSize: 14,
        fontFamily: Fonts.name.regular,
        color: Colors.BlackColor700,
    },
    segmentButtonTextSelected: {
        color: Colors.Defaultwhite,
        fontFamily: Fonts.name.medium,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    chevronIcon: {
        width: 16,
        height: 16,
        tintColor: Colors.BlackColor500,
    },
    removeText: {
        color: '#f44336',
    },
    doneButton: {
        backgroundColor: Colors.Defaultwhite,
        borderRadius: 8,
        alignItems: "flex-end"
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: "space-between",
        alignSelf: 'center',
        width: '100%',
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    carIcon: {
        width: 24,
        height: 24,
    },
    headerText: {
        fontSize: 16,
        fontFamily: Fonts.name.medium,
        color: Colors.Defaultblack,
    },
    doneButtonText: {
        fontSize: 16,
        fontFamily: Fonts.name.medium,
        color: Colors.Blue500,
    },
});

export default LocationDetailsCard; 