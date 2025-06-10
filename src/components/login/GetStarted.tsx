import React from 'react'
import { WarpperComponent } from '../common'
import { BaseProps, Colors, Fonts, Images } from '../../constants'
import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Strings from '../../language/Strings'
import { reset } from '../../navigation/RootNavigation'

const GetStarted: React.FC<BaseProps> = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.how_to_use}>
                {Strings.how_to_use}
            </Text>
            <ImageBackground source={Images.ic_introimage} style={styles.introVideo}>
                <TouchableOpacity style={styles.playButton}>
                    <Text style={styles.playIcon}>▶</Text>
                </TouchableOpacity>
            </ImageBackground>
            <TouchableOpacity onPress={() => reset("MainHome")}>
                <Text style={styles.used_before}>{Strings.used_before}</Text>
            </TouchableOpacity>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        margin: 50
    },
    how_to_use: {
        fontSize: 24,
        color: Colors.Gray700,
        marginBottom: 20,
        textAlign: 'center',
        fontFamily: Fonts.name.bold
    },
    introVideo: {
        flex: 1,
        width: '100%',
        marginBottom: 20,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
    },
    used_before: {
        fontSize: Fonts.size._18px,
        color: Colors.Gray400,
        textAlign: 'center',
        fontFamily: Fonts.name.regular,
        marginBottom: 20,
        marginTop: 20,
        lineHeight: 20,
    },
    playButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "white",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: Colors.Gray200,
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    playIcon: {
        fontSize: 28,
        color: Colors.BlueColor,
    },


})
export default WarpperComponent(GetStarted)
