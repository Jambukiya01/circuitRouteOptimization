import { NetInfoState } from "@react-native-community/netinfo";
import { store } from "../App";
import { Utils } from "../constants";
import Strings from "../language/Strings";
import { PlaceAutoPredictionModel } from "../model/LocationModel";
import { SessionState } from "../store/reducers/SessionReducer";
import apiCall from "./ApiService";

export const getPlacesFromGoogle = async (textInputmap: string, googleAPIKey: string,
    lat: number, long: number): Promise<any[]> => {
    return new Promise(async (resolve, reject) => {
        let session: SessionState = store.getState().session;
        let placePredictionModels: PlaceAutoPredictionModel[] = [];
        let params = {
            latitude: lat,
            longitude: long,
            company_status: "active",
            company_id: 663,
            keyword: textInputmap
        }

        apiCall({
            baseUrl: "https://api.yelowtaxi.com/api/", endPoint: "v3.3/base/map/places",
            params: params, method: "get"
        }, (res: any) => {
            let placePredictionModelList: PlaceAutoPredictionModel[] = [];
            console.log("places", res)

            if (res?.places) {
                let data;
                try {
                    if (typeof res.places === "string")
                        JSON.parse(res?.places)
                    else data = res.places
                } catch (error) {
                    data = res.places
                }
                data.map((value: any) => {
                    let placePredictionModel: PlaceAutoPredictionModel = {
                        placeId: value.place_id,
                        full_text: value.full_text,
                        primary_text: value.primary_text,
                        latitude: value.latitude,
                        longitude: value.longitude,
                        address: value.full_text || ''
                    }
                    placePredictionModelList.push(placePredictionModel);
                })
                console.log("response", placePredictionModelList)

            }
            resolve(placePredictionModelList)

        }, (error, errorCode?: number) => {
            console.log("errorerrorerror", error, errorCode);
            reject(error)

        })

    })
}
export const getPlaceLatLngFromGoogle = async (placeItem: PlaceAutoPredictionModel): Promise<any> => {

    const placeId = placeItem.placeId

    return new Promise(async (resolve, reject) => {
        //https://maps.googleapis.com/maps/api/place/details/json?place_id=
        let params = {
            company_id: 663,
            address: placeItem.full_text,
            place_id: placeId,
        }
        apiCall({
            baseUrl: "https://api.yelowtaxi.com/api/", endPoint: "v3.3/base/map/geocode",
            params: params, method: "get"
        }, (res: any) => {
            console.log("---GET PLACE DETAILS---", res)
            if (res && res?.latitude && res?.longitude) {
                let lat = res?.latitude;
                let lng = res?.longitude;

                resolve({
                    latitude: lat,
                    longitude: lng
                });
            } else {
                reject(Strings.something_went_wrong)
            }
        }, (error, error_code) => {
            console.log("error", error, error_code);
            reject(error)
        })
    })
}

export const getAddressFromLatLng = async (
    region: { latitude: number; longitude: number },
    // Company ID is required for dispatchMapboxaddress
    shortName?: boolean
) => {
    const { latitude, longitude } = region;

    for (let i = 0; i < 2; i++) {
        try {
            const fallbackResponse = await fetchLocation(latitude, longitude);
            if (fallbackResponse) {
                return shortName ? fallbackResponse : fallbackResponse.display_name;
            }
        } catch (fallbackError) {
            console.error(`LocationIQ API Error (Attempt ${i + 1}):`, fallbackError);
        }
    }
};

const fetchLocation = async (lat: number, lon: number) => {
    const API_KEY = 'pk.19f0d56c0be4acd58a9b97ee7d796e39';
    const url = `https://us1.locationiq.com/v1/reverse?key=${API_KEY}&lat=${lat}&lon=${lon}&format=json`;

    try {
        let response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }
        let data = await response.json();
        console.log('LocationIQ Data:', data);
        return data;
    } catch (error) {
        console.error('Error fetching location:', error);
        throw error; // Propagate error for retry
    }
};