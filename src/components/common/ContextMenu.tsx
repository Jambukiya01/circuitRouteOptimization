import React, { useRef, useState } from 'react';
import {
    View,
    TouchableOpacity,
    Image,
    StyleSheet,
    Modal,
    Text,
    Dimensions,
    TouchableWithoutFeedback,
    Animated,
    ViewStyle,
    ImageStyle,
} from 'react-native';
import { Images, Colors } from '../../constants';
import { useTheme } from '../../context/ThemeContext';

interface MenuAction {
    id: string;
    title: string;
    titleColor: string;
}

interface ContextMenuProps {
    actions?: MenuAction[];
    onPressAction?: (action: MenuAction) => void;
    onOpenMenu?: () => void;
    onCloseMenu?: () => void;
    moreOptionsIconStyle?: any;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
    actions = [],
    onPressAction,
    onOpenMenu,
    onCloseMenu,
    moreOptionsIconStyle
}) => {
    const { theme, setTheme, isDarkMode } = useTheme();
    const [isVisible, setIsVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const buttonRef = useRef<View>(null);
    const moreOptionsIconStyleNew = [{
        width: 24,
        height: 24,
    } as ImageStyle, moreOptionsIconStyle];

    const handleButtonPress = () => {
        if (buttonRef.current) {
            buttonRef.current.measure((_x: number, _y: number, _width: number, _height: number, pageX: number, pageY: number) => {
                setMenuPosition({
                    x: pageX,
                    y: pageY + _height,
                });
                setIsVisible(true);
                onOpenMenu?.();
            });
        }
    };

    const handleActionPress = (action: MenuAction) => {
        setIsVisible(false);
        onPressAction?.(action);
    };

    const handleClose = () => {
        setIsVisible(false);
        onCloseMenu?.();
    };

    const renderMenu = () => {
        if (!isVisible) return null;

        const { width: screenWidth } = Dimensions.get('window');
        const menuWidth = 200;
        const rightPosition = screenWidth - menuPosition.x;
        const shouldShowOnLeft = rightPosition < menuWidth;

        return (
            <Modal
                visible={isVisible}
                transparent
                animationType="fade"
                onRequestClose={handleClose}
            >
                <TouchableWithoutFeedback onPress={handleClose}>
                    <View style={styles.modalOverlay}>
                        <View
                            style={[
                                styles.menuContainer,
                                {
                                    top: menuPosition.y,
                                    left: shouldShowOnLeft ? undefined : menuPosition.x,
                                    right: shouldShowOnLeft ? screenWidth - menuPosition.x : undefined,
                                    backgroundColor: Colors.Background(isDarkMode),
                                    borderColor: Colors.Border(isDarkMode),
                                },
                            ]}
                        >
                            {actions.map((action) => (
                                <TouchableOpacity
                                    key={action.id}
                                    style={styles.menuItem}
                                    onPress={() => handleActionPress(action)}
                                >
                                    <Text style={[styles.menuItemText, { color: action.titleColor }]}>
                                        {action.title}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        );
    };

    return (
        <View>
            <TouchableOpacity
                ref={buttonRef}
                onPress={handleButtonPress}
            >
                <Image
                    source={Images.ic_more_options}
                    style={moreOptionsIconStyleNew}
                />
            </TouchableOpacity>
            {renderMenu()}
        </View>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    menuContainer: {
        position: 'absolute',
        width: 200,
        borderRadius: 8,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 1000,
    },
    menuItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    },
    menuItemText: {
        fontSize: 14,
    },
});

export default ContextMenu;
