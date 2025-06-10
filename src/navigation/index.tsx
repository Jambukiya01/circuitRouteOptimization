import { NavigationContainer } from '@react-navigation/native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { navigationRef } from './RootNavigation';
import Splash from '../components/splash/Splash';
import LoginOptions from '../components/login/LoginOptions';
import GetStarted from '../components/login/GetStarted';
import DrawerMain from '../components/SideMenu/DrawerMain';
import RouteDetails from '../components/routeDetails/RouteDetails';
import BreakSetup from '../components/routeDetails/BreakSetup';
import ChangeLocation from '../components/home/ChangeLocation';
import Help from '../components/help/Help';
import LocationFromPin from '../components/home/LocationFromPin';
const Stack = createNativeStackNavigator();


export default () => {

    return (
        <NavigationContainer ref={navigationRef}>
            <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
                <Stack.Screen component={Splash} name="Splash" />
                <Stack.Screen component={LoginOptions} name="LoginOptions" />
                <Stack.Screen component={GetStarted} name="GetStarted" />
                <Stack.Screen component={DrawerMain} name="MainHome" />
                <Stack.Screen component={RouteDetails} name="RouteDetails" />
                <Stack.Screen component={BreakSetup} name="BreakSetup" />
                <Stack.Screen component={ChangeLocation} name="ChangeLocation" />
                <Stack.Screen component={Help} name="Help" />
                <Stack.Screen component={LocationFromPin} name="LocationFromPin" />
            </Stack.Navigator>
        </NavigationContainer>
    )
}