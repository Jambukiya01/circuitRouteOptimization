import { Fonts, Images } from "../../constants";

import { Image, StyleSheet, Text, View } from "react-native";

import { TouchableOpacity } from "react-native";
import { Colors } from "../../constants";
import { useTheme } from "../../context/ThemeContext";
import LottieView from "lottie-react-native";

interface ActionItemProps {
    iconSource: any;
    label: string | number;
    labelColor?: string;
    backgroundColor?: string;
    showForward?: boolean;
    onPress: () => void;
    lottieIcon?: boolean;
}


const ActionItem: React.FC<ActionItemProps> = ({
    iconSource,
    label,
    labelColor,
    backgroundColor,
    showForward = false,
    onPress,
    lottieIcon = false
}) => {
    const { isDarkMode } = useTheme();
    return (
        <TouchableOpacity style={[styles.actionItem, { backgroundColor: Colors.Background(isDarkMode), borderBottomColor: Colors.Border(isDarkMode) }, { backgroundColor }]} onPress={onPress}>
            <View style={styles.actionItemLeft}>
                {lottieIcon ? <LottieView source={iconSource} autoPlay loop style={[styles.actionItemIcon]} /> :
                    <Image source={iconSource} style={[styles.actionItemIcon, { tintColor: labelColor }]} />}
                <Text style={[styles.actionItemLabel, { color: labelColor ? labelColor : Colors.Text(isDarkMode) }]}>{label}</Text>
            </View>
            {showForward && (
                <Image source={Images.ic_chevron_right} style={[styles.forwardIcon, { tintColor: Colors.Text(isDarkMode) }]} />
            )}
        </TouchableOpacity>
    );
};
const styles = StyleSheet.create({
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.BlackColor200
    },
    actionItemLeft: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    actionItemIcon: {
        width: 25,
        height: 25,
        marginRight: 16,
        tintColor: Colors.BlackColor700
    },
    actionItemLabel: {
        fontSize: Fonts.size._16px,
        fontFamily: Fonts.name.medium,
        color: Colors.BlackColor700
    },
    forwardIcon: {
        width: 16,
        height: 16,
        tintColor: Colors.BlackColor500
    },
});
export default ActionItem;
