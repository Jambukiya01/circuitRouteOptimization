import React, { useState } from 'react'
import { Pressable, Keyboard, View, Text, Image, ActivityIndicator } from "react-native"
import { Colors, Fonts } from '../../constants'
import LottieView from 'lottie-react-native'
import { useTheme } from '../../context/ThemeContext'
interface ButtonProps {
    disabled?: boolean
    onPress?: () => void
    loading?: boolean
    title: string
    style?: any
    removeBackground?: boolean
    leftImage?: any
    leftImageStyle?: any
    buttonTitleStyle?: any
    isLeftImageLottie?: boolean
}
const Button: React.FC<ButtonProps> = ({ disabled, onPress, loading, title, style,
    removeBackground, leftImage, leftImageStyle, buttonTitleStyle, isLeftImageLottie, }) => {
    const { theme, setTheme, isDarkMode } = useTheme();
    const button = {
        backgroundColor: removeBackground ? "transparent" : Colors.Background(isDarkMode),
        height: 56,
        opacity: disabled ? 0.5 : 1,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: 'row',
        width: 'auto',
    }
    const textStyle =
        [{
            color: Colors.Text(isDarkMode),
            fontFamily: Fonts.name.medium,
            fontSize: Fonts.size._16px,
            lineHeight: 24,
            textAlign: "center",
            flexWrap: "wrap",
        }, buttonTitleStyle
        ]
    const leftImageCustomeStyle = [
        {
            marginHorizontal: 15,
            height: 20,
            width: 20,
            // tintColor: Colors.Text(isDarkMode),
        }, leftImageStyle
    ]
    const [disabledDoubleClick, setDisabledDoubleClick] = useState(false)
    const debouncedOnPress = () => {
        Keyboard.dismiss()
        onPress && onPress();
    }
    const _onPress = () => {

        setDisabledDoubleClick(true)
        debouncedOnPress()
        setTimeout(() => {
            setDisabledDoubleClick(false)
        }, 2000)
    }
    return (

        <Pressable disabled={disabled || disabledDoubleClick}
            style={[
                button,
                style,
            ]}
            onPress={_onPress}
        >
            <View style={{ flexDirection: 'row', alignItems: "center" }}>
                {
                    <View style={{ flexDirection: 'row', alignItems: "center", justifyContent: "flex-start" }}>
                        {leftImage ? isLeftImageLottie ? <LottieView source={leftImage} autoPlay loop style={leftImageCustomeStyle} /> :
                            <Image style={leftImageCustomeStyle} source={leftImage} /> : null}
                        <Text style={textStyle}>{title}</Text>
                        {loading ?
                            <ActivityIndicator color={Colors.Defaultwhite} style={{ marginStart: 12 }} /> : null}
                    </View>
                }
            </View>
            {/* <View style={{ flexDirection: 'row', alignItems: "center", width: "100%" }}>
                <Text style={textStyle}>{title}</Text>
            </View> */}
        </Pressable>
    )
}

export default Button