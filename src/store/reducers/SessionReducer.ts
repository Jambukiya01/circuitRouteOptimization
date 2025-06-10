import { Region } from "react-native-maps";
import { KEY_CURRENT_ROUTE_TRIP, KEY_LANGUAGE, KEY_NO_OF_STEPS, KEY_PREFERENCES, KEY_ROUTE_TRIP_DATA, KEY_USER_LOCATION } from "../../data/storeKey"
import { LanguageModel } from "../../model/LanguageModel";
import { Preferences, RouteTrip } from "../../model/LocationModel";
import { Action } from "../actions/CommonActions"
import { CLEAR_SESSION, SET_SESSION_FIELD } from "../actions/SessionActions"
import { defaultPreferences } from "../../data/defaultData";

export interface SessionState {
    [KEY_NO_OF_STEPS]: number;
    [KEY_LANGUAGE]?: LanguageModel;
    [KEY_CURRENT_ROUTE_TRIP]?: RouteTrip;
    [KEY_ROUTE_TRIP_DATA]?: RouteTrip[];
    [KEY_USER_LOCATION]?: Region;
    [KEY_PREFERENCES]?: Preferences;
    [key: string]: any; // Allow any string key for dynamic properties
}

const INIT_STATE: SessionState = {
    [KEY_NO_OF_STEPS]: 3,
    [KEY_PREFERENCES]: defaultPreferences
}

export default (state: SessionState = INIT_STATE, action: Action) => {

    switch (action.type) {

        case SET_SESSION_FIELD:
            return { ...state, [action.payload.key]: action.payload.value }

        case CLEAR_SESSION:
            return { ...INIT_STATE }
    }

    return state
}