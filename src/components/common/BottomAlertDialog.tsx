import React, { useCallback, useRef } from 'react';
import {
    View,
    Modal,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    TouchableWithoutFeedback,
    Platform,
    PanResponder,
    Animated,
} from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import Colors from '../../constants/Colors';
import { useTheme } from '../../context/ThemeContext';

interface BottomAlertDialogProps {
    visible: boolean;
    title?: string;
    message?: string;
    buttons?: Array<{
        text: string;
        onPress: () => void;
        style?: 'default' | 'cancel' | 'destructive';
    }>;
    onDismiss?: () => void;
    children?: React.ReactNode;
    cancelable?: boolean;
    extraView?: React.ReactNode;
    fullScreen?: boolean;
    dialogBackgroundColor?: string;
    onTouchOutside?: () => void;
}

const SWIPE_THRESHOLD = 50;

const BottomAlertDialog: React.FC<BottomAlertDialogProps> = ({
    visible,
    title,
    message,
    buttons = [],
    onDismiss,
    children,
    cancelable = true,
    extraView,
    fullScreen = false,
    dialogBackgroundColor,
    onTouchOutside,
}) => {
    const pan = useRef(new Animated.ValueXY()).current;
    const translateY = useRef(new Animated.Value(0)).current;
    const { theme, setTheme, isDarkMode } = useTheme();
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return gestureState.dy > 0; // Only allow downward swipes
            },
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) { // Only move if swiping down
                    translateY.setValue(gestureState.dy);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > SWIPE_THRESHOLD) {
                    // If swipe distance is greater than threshold, dismiss the dialog
                    if (cancelable) {
                        Animated.timing(translateY, {
                            toValue: SCREEN_WIDTH,
                            duration: 200,
                            useNativeDriver: true,
                        }).start(() => {
                            if (onDismiss) {
                                onDismiss();
                            }
                        });
                    } else {
                        // If not cancelable, animate back to original position
                        Animated.spring(translateY, {
                            toValue: 0,
                            useNativeDriver: true,
                        }).start();
                    }
                } else {
                    // If swipe distance is less than threshold, animate back to original position
                    Animated.spring(translateY, {
                        toValue: 0,
                        useNativeDriver: true,
                    }).start();
                }
            },
        })
    ).current;

    const handleBackdropPress = useCallback(() => {
        if (cancelable) {
            if (onTouchOutside) {
                onTouchOutside();
            }
            if (onDismiss) {
                onDismiss();
            }
        }
    }, [cancelable, onDismiss, onTouchOutside]);

    const renderButton = useCallback((button: {
        text: string;
        onPress: () => void;
        style?: 'default' | 'cancel' | 'destructive';
    }, index: number) => {
        const buttonStyle = [
            styles.button,
            index > 0 && styles.buttonBorder,
            button.style === 'destructive' && styles.destructiveButton,
            button.style === 'cancel' && styles.cancelButton,
        ];

        const textStyle = [
            styles.buttonText,
            button.style === 'destructive' && styles.destructiveText,
            button.style === 'cancel' && styles.cancelText,
        ];

        return (
            <TouchableOpacity
                key={index}
                style={buttonStyle}
                onPress={button.onPress}
                activeOpacity={0.7}
            >
                <Text style={textStyle}>{button.text}</Text>
            </TouchableOpacity>
        );
    }, []);

    const containerStyle = {
        ...styles.container,
        backgroundColor: dialogBackgroundColor || Colors.Background(isDarkMode),
        marginTop: !fullScreen ? getStatusBarHeight() : 0,
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onDismiss}
        >
            <TouchableWithoutFeedback onPress={handleBackdropPress}>
                <View style={styles.backdrop}>
                    <TouchableWithoutFeedback>
                        <Animated.View
                            style={[
                                containerStyle,
                                { transform: [{ translateY }] }
                            ]}
                            {...panResponder.panHandlers}
                        >
                            <View style={styles.dragIndicator} />
                            {extraView || (
                                <>
                                    {title && <Text style={styles.title}>{title}</Text>}
                                    {message && <Text style={styles.message}>{message}</Text>}
                                    {children}
                                </>
                            )}
                            <View style={styles.buttonContainer}>
                                {buttons.map((button, index) => renderButton(button, index))}
                            </View>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PADDING = 20;

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: Colors.Defaultwhite,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 20,
        paddingBottom: Platform.OS === 'ios' ? getStatusBarHeight() : 0,
        width: SCREEN_WIDTH,
        maxHeight: SCREEN_WIDTH * 1.5,
    },
    dragIndicator: {
        width: 40,
        height: 4,
        backgroundColor: Colors.DefaultLightGrey,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.DefaultBlack,
        textAlign: 'center',
        marginBottom: 8,
        paddingHorizontal: PADDING,
    },
    message: {
        fontSize: 16,
        color: Colors.DefaultGrey,
        textAlign: 'center',
        marginBottom: 20,
        paddingHorizontal: PADDING,
    },
    buttonContainer: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: Colors.DefaultLightGrey,
    },
    button: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonBorder: {
        borderLeftWidth: 1,
        borderLeftColor: Colors.DefaultLightGrey,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '500',
        color: Colors.DefaultBlue,
    },
    destructiveButton: {
        backgroundColor: Colors.DefaultRed,
    },
    destructiveText: {
        color: Colors.Defaultwhite,
    },
    cancelButton: {
        backgroundColor: Colors.DefaultLightGrey,
    },
    cancelText: {
        color: Colors.DefaultBlack,
    },
});

export default BottomAlertDialog; 