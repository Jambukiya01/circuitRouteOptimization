import { createDrawerNavigator } from '@react-navigation/drawer';
import React from 'react';
import Sidemenu from './Sidemenu';
import { Dimensions } from 'react-native';
import MainHome from '../home/MainHome';
import { wp } from '../../constants';
import Help from '../help/Help';
import Settings from '../settings/Settings';
import AddRouteTrip from '../routeDetails/AddRouteTrip';

const Drawer = createDrawerNavigator()

const DrawerMain: React.FC = () => {

    return (
        <Drawer.Navigator drawerType="back"
            detachInactiveScreens={true}
            screenOptions={
                {
                    headerShown: false,
                    drawerStyle: {
                        width: Dimensions.get('window').width / 1.1,
                    },
                }
            }
            drawerStyle={{ width: wp(100) }}
            drawerContent={(props) => <Sidemenu navigation={props.navigation} />}
            initialRouteName={"MainHome"}>
            <Drawer.Screen name={"MainHome"} component={MainHome} />
            <Drawer.Screen name={"Help"} component={Help} />
            <Drawer.Screen name={"Settings"} component={Settings} />
            <Drawer.Screen name={"AddRouteTrip"} component={AddRouteTrip} />
        </Drawer.Navigator>
    )
}
export default DrawerMain