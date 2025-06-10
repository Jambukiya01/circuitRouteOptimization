import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { WarpperComponent } from '../common'
import { BaseProps } from '../../constants'
import { goBack } from '../../navigation/RootNavigation'

const Help: React.FC<BaseProps> = ({ navigation }) => {
    return (
        <View style={styles.container}>
            {/* Back Button */}
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => goBack()}
            >
                <Text style={styles.backButtonText}>{"< Back"}</Text>
            </TouchableOpacity>

            {/* Main Content */}
            <View style={styles.content}>
                <Text style={styles.text}>Under Implementation</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 20, // Adds top padding for better positioning
    },
    backButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        backgroundColor: '#007AFF',
        padding: 10,
        borderRadius: 5,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    content: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
})

export default WarpperComponent(Help)
