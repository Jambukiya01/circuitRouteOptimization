import React, { useEffect, } from 'react'
import { Image, Text, View } from 'react-native'
import Strings from '../../language/Strings'
import { BaseProps, Images } from '../../constants'
import WarpperComponent from '../common/WarpperComponent'
import navigation from '../../navigation'
import { navigate } from '../../navigation/RootNavigation'

const Splash: React.FC<BaseProps> = ({ session, setSession }) => {
    console.info(session);
    useEffect(() => {
        setSession("test", "test Store")
        setTimeout(() => {
            navigate("LoginOptions")

        }, 1000);
    }, [])
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Image source={Images.ic_introimage} style={{ width: '100%', height: '100%' }} />
        </View>
    )
}
export default WarpperComponent(Splash)