import { Image, StyleSheet, Text, View } from "react-native";

import { TouchableOpacity } from "react-native";
import { Colors, Fonts } from "../../constants";

interface ActionButtonProps {
    icon: any;
    label: string;
    onPress: () => void;
    backgroundColor?: string;
    labelColor?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
    icon,
    label,
    onPress,
    backgroundColor = Colors.Defaultwhite,
    labelColor = Colors.BlackColor700
}) => (
    <TouchableOpacity
        style={[styles.actionButton, { backgroundColor }]}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <View style={[styles.actionButtonInner, { backgroundColor }]}>
            <Image
                source={icon}
                style={[styles.actionIcon, { tintColor: labelColor }]}
                resizeMode="contain"
            />
            <Text
                style={[styles.actionText, { color: labelColor }]}
                numberOfLines={1}
                adjustsFontSizeToFit
            >
                {label}
            </Text>
        </View>
    </TouchableOpacity>
);
const styles = StyleSheet.create({
    actionButton: {
        flex: 1,
        marginHorizontal: 4,
        maxWidth: "auto",
    },
    actionButtonInner: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.Defaultwhite,
        borderRadius: 10,
        padding: 8,
        paddingVertical: 12,
        height: 85,
        // Add shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
        elevation: 2,
    },
    actionIcon: {
        width: 28,
        height: 28,
        marginBottom: 10,
        tintColor: Colors.BlackColor700,
    },
    actionText: {
        fontSize: Fonts.size._12px,
        fontFamily: Fonts.name.bold,
        color: Colors.BlackColor800,
        textAlign: 'center',
        paddingHorizontal: 2,
        lineHeight: 14,
    },
});

export default ActionButton;
