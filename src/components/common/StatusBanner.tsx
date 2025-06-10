import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors, Fonts } from "../../constants";

interface StatusBannerProps {
    icon: any;
    iconColor: string;
    text: string;
    textColor: string;
    backgroundColor?: string;
    onUndo: () => void;
}
const StatusBanner: React.FC<StatusBannerProps> = ({
    icon,
    iconColor,
    text,
    textColor,
    backgroundColor,
    onUndo
}) => (
    <View style={[styles.statusContainer, { backgroundColor }]}>
        <View style={styles.statusContent}>
            <Image source={icon} style={[styles.statusIcon, { tintColor: iconColor }]} />
            <Text style={[styles.statusText, { color: textColor }]}>{text}</Text>
        </View>
        <TouchableOpacity onPress={onUndo}>
            <Text style={styles.undoText}>Undo</Text>
        </TouchableOpacity>
    </View>
);

const styles = StyleSheet.create({
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 8,
        padding: 12,
        marginVertical: 8
    },
    statusContent: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    statusIcon: {
        width: 20,
        height: 20,
        marginRight: 8
    },
    statusText: {
        fontSize: Fonts.size._14px,
        fontFamily: Fonts.name.medium
    },
    undoText: {
        fontSize: Fonts.size._14px,
        fontFamily: Fonts.name.medium,
        color: Colors.Blue500
    },
})

export default StatusBanner;
