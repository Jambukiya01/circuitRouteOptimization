import React from 'react'
import { SafeAreaView, ImageBackground, Text, StyleSheet, View, Image } from "react-native"
import WarpperComponent from '../common/WarpperComponent'
import { BaseProps, Colors, Fonts, Images } from '../../constants'
import { Button } from '../common'
import Strings from '../../language/Strings'
import { navigate } from '../../navigation/RootNavigation'

const LoginOptions: React.FC<BaseProps> = ({ session, setSession }) => {
    const loginWithGoogle = () => {
        console.info("--- Login with Google ---");
        navigate("GetStarted")
    }
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.ImageBackground}>
                {/* <ImageBackground source={Images.ic_introimage} resizeMode="cover" style={styles.ImageBackground}> */}
                <View style={styles.headerContainer}>
                    <Image source={Images.ic_yelowsoft_logo} style={styles.headerImage} />
                </View>
                <Button title={Strings.continue_google}
                    onPress={loginWithGoogle}
                    style={styles.buttonStyle}
                    leftImage={Images.ic_google} />
                <Button title={Strings.continue_apple}
                    onPress={loginWithGoogle}
                    style={styles.buttonStyle}
                    leftImage={Images.ic_apple} />
                <Button title={Strings.continue_email}
                    onPress={loginWithGoogle}
                    style={styles.buttonStyle}
                    leftImage={Images.ic_email} />
                <Button title={Strings.continue_mobile}
                    onPress={loginWithGoogle}
                    style={styles.buttonStyle}
                    removeBackground />
                <Text style={[styles.textStyle, { marginBottom: 20 }]}>{Strings.condation}</Text>
                {/* </ImageBackground> */}
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    headerContainer: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerImage: {
        // width: 150,
        // height: 150,
    },
    ImageBackground: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    buttonStyle: {
        width: "85%",
        marginVertical: 10
    },
    textStyle: {
        fontSize: Fonts.size._12px,
        color: Colors.Defaultblack,
        textAlign: 'center',
        fontFamily: Fonts.name.medium,
    }
})

export default WarpperComponent(LoginOptions)