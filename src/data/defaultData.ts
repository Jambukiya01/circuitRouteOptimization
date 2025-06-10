import { Region } from "react-native-maps";
import { Preferences } from "../model/LocationModel";

export const defaultRouteTripData = {
    routeName: '',
    date: '',
    carryOverStops: false,
    locations: [],
    updatedAt: '',
    isOptimized: false,
    tripId: '',
    distance: 0,
    time: 0,
    endTime: '',
    startTime: '',
    tripStatus: 'not_started',
    extraCricuitData: {},
};

export const DEFAULT_REGION: Region = {
    latitude: 22.992115,
    longitude: 72.497523,
    latitudeDelta: 0.015,
    longitudeDelta: 0.0121,
};

export const defaultPreferences: Preferences = {
    theme: 'Light',
    distanceUnit: 'Kilometers',
    averageTimeAtStop: { minutes: 1, seconds: 0 },
    vehicleType: 'Car',
    avoidTolls: false,
    packageId: true,
    navigationModeBubble: true,
    navigationApp: 'Google Maps',
    stopSide: 'Left',
};
