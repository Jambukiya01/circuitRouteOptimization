import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import axios, { AxiosResponse } from 'axios';
import { sign } from 'react-native-pure-jwt';
import { SessionState } from '../store/reducers/SessionReducer';
import { store } from '../App';
import Strings from '../language/Strings';
import { JWT_SECRET } from '../constants/Constants';
import { Utils } from '../constants';
import { getRoute } from '../navigation/RootNavigation';



export type METHOD = "post" | "get" | "put" | "delete" | "patch"

export interface Response<T> {

    data: T,
    status?: number,
    success?: number,
    message: string,
    under_maintainance: string,
    error: [string],
    error_code: any


}

interface Config {
    baseUrl?: string,
    params?: any,
    endPoint: string,
    method?: METHOD,
    forceLive?: boolean,
    headers?: any;
    token?: string;
}

const apiCall = async <T>(apiConfig: Config,
    onSuccess: (res: T) => void,
    onFailure: (error: any, errorCode?: number, underMaintainace?: any) => void) => {

    const session: SessionState = store.getState().session

    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();

    let endpoint = apiConfig.endPoint;
    let params: any = apiConfig.params || {};
    const method: METHOD = apiConfig.method || "post"
    const currentDate = new Date().getTime()
    const dataDogAttr: any = {}

    // params.language = 'en'

    const baseURL = "https://api.yelowtaxi.com/api/"

    const isConnected: NetInfoState = await NetInfo.fetch()
    console.log("Internet connection", isConnected);

    if (!isConnected.isConnected) {
        Utils.showErrorToast(Strings.please_check_internet)
        onFailure('')
    } else {
        let payloadToken = await sign(
            {
                exp: new Date().getTime() + 60 * 100 * 1000,
                additional: params,
            },
            JWT_SECRET, {
            alg: "HS256",
        })

        //  params.language_id = lang;
        console.log(JSON.stringify(params));
        if (params._path != undefined) {
            endpoint = `${endpoint}/${params._path}`
            let updatedParams = JSON.parse(JSON.stringify(params))
            delete updatedParams._path;
            params = updatedParams
        }
        if (params.company_uuid != undefined) {
            // company_uuid = params.company_uuid
            let updatedParams = JSON.parse(JSON.stringify(params))
            delete updatedParams.company_uuid;
            params = updatedParams
        }

        console.log("params._path", params._path);

        // params = { ...params, ...store.getState().common.deviceInfo }
        let headers: any = { "Accept": "application/json", "Accept-Language": "en", "Authorization": "Token S4yR0LdAKnagYjUikU07sUH5OJ9U15SSc4YsmTBq", "Cache-Control": "no-cache", "Content-Type": "application/json", "apikey": "p0aupwakl0rmeo8da8u9uwvgwe4zxdcv", "app_info": "{\"user_type\":\"3\",\"latitude\":23.024553,\"longitude\":72.58957,\"device_type\":\"A\",\"platform\":\"ReactNative\",\"screen\":\"DispatchLocationSelect\",\"network_type\":\"wifi\",\"app_version\":\"\\\"1.1.24\\\"\"}", "app_version": "\"1.1.24\"", "batterylevel": undefined, "device_info": "{\"DeviceVersion\":\"39\",\"DeviceVersionName\":\"1.1.24\",\"DeviceManufacturer\":\"Genymobile\",\"DeviceIpAddress\":\"10.0.3.16\",\"DeviceId\":\"5151f2192ed593b4\",\"DeviceModel\":\"Pixel 7\",\"DeviceMemoryUsed\":\"656.72 MB\",\"DeviceTotalMemeory\":\"8320.27 MB\",\"DeviceFreeDiskSpace\":\"1470.14 GB\",\"DeviceTotalDiskCapacity\":\"1745.63 GB\",\"DevicePowerState\":{\"lowPowerMode\":false,\"batteryLevel\":1,\"batteryState\":\"full\"},\"publicIp\":\"122.170.50.96\"}", "device_type": "A", "devicefreediskspace": "1470.14 GB", "hash": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NDI0NDUzOTQsImFkZGl0aW9uYWwiOnsiQXV0aG9yaXphdGlvbiI6IlRva2VuIFM0eVIwTGRBS25hZ1lqVWlrVTA3c1VINU9KOVUxNVNTYzRZc21UQnEiLCJhcGlrZXkiOiJwMGF1cHdha2wwcm1lbzhkYTh1OXV3dmd3ZTR6eGRjdiJ9fQ.Ak2x0XRdstiVc0TI18uXdS8Mkoyk0csgkInu0g6AsxM", "network_type": "wifi", "platform": "Android", "screen": "DispatchLocationSelect", "timezone": "Asia/Kolkata", "user_id": "ede546b5084941779f2a1087c891b279", "validation": "5819533500788106892804592348477708368221" }
        // if (apiConfig.headers) {
        //     headers = { ...headers, ...apiConfig.headers }
        // }
        console.log("Header API key : ", params)
        // if (params._parts) {

        //     headers = {
        //         ...headers,
        //         'Content-Type': 'multipart/form-data'
        //     }
        // }

        let screen = ""
        const route = getRoute()
        if (route) {
            screen = route.name
        }

        let appinfo = {
            user_type: "5",
            device_type: Utils.getDeviceType(),
            platform: "ReactNative",
            screen,
            network_type: isConnected.type,
        }

        // headers.user_id = session[KEY_DISPATCHER]?.id
        // headers.device_info = JSON.stringify(session[KEY_DEVICE_INFO] || {})
        // headers.app_info = JSON.stringify(appinfo)
        // headers.hash = payloadToken


        console.log('---------------------------------------------')
        console.log(`------------------Api Params of ${endpoint}-------------------`)
        console.log('url', baseURL + endpoint)
        // console.log("Token", token);
        // console.log("apiKey", company_uuid);
        console.log("header", headers);
        console.log("Params")
        console.log("Method", method)
        console.log(JSON.stringify(params));
        // console.log('--------------------------------------------------------------')

        // let paramsData = new FormData()

        // for (const property in params) {
        //     paramsData.append(property, params[property])
        // }

        // if (paramsData._parts.length)
        //     params = paramsData
        // else
        //     params.company_id = getUserFromStore().company_id || appConfig.COMPANY_ID;


        //params = stringify(params)
        const config = {
            baseURL: baseURL,
            params,
            timeout: 60000,
            headers: headers,
            cancelToken: source.token
        }

        let request: Promise<any>


        switch (method) {

            case "post":
                request = axios.post(endpoint, params, config)
                break;
            case "get":
                request = axios.get(endpoint, config)
                break;
            case "delete":
                request = axios.delete(endpoint, config)
                break;
            case "put":
                request = axios.put(endpoint, params, config)
                break;
            case "patch":
                request = axios.patch(endpoint, params, config)
                break;
        }
        dataDogAttr.url = endpoint
        dataDogAttr.host = baseURL
        dataDogAttr.method = method.toUpperCase()
        dataDogAttr.screen_name = screen
        dataDogAttr.params = JSON.stringify(params)
        dataDogAttr.headers = JSON.stringify(headers)
        //  console.log("state", store.getState())
        request.then((response: AxiosResponse<Response<T>>) => {
            dataDogAttr.start_date = Utils.formatDate(currentDate, "hh:mm:ss.SSS", true)
            dataDogAttr.end_date = Utils.formatDate(new Date().getTime(), "hh:mm:ss.SSS", true)
            dataDogAttr.duration = `${new Date().getTime() - currentDate}ms`
            if (response) {
                dataDogAttr.status_code = response.status
                dataDogAttr.response = response.data
                if (response.status == 200) {
                    console.log(`------------------ Response of ${endpoint} -------------------`)
                    console.log(JSON.stringify(response.data))
                    console.log('--------------------------------------------------------------')
                    if (response.data.status == 1 || response.data.success == 1) {
                        try {


                            onSuccess(response.data.data)

                            //onSuccess(response)

                        } catch (err) {
                            console.log('Error', err);
                            if (err) {
                                dataDogAttr.errorMsg = err.toString()
                            }
                            onFailure(Strings.something_went_wrong)
                        }

                    } else {
                        const error: any = response.data.message || response.data.error && response.data.error[0];
                        if (error) {
                            dataDogAttr.errorMsg = error.toString()
                        }
                        const under_maintainance = response.data.under_maintainance || "N"
                        onFailure(error && typeof (error) === "string" ? error : Strings.something_went_wrong, response.data.error_code || -1, under_maintainance == "Y")
                    }
                } else if (response.status == 401) {

                    //onFailure('Session expired')

                } else {
                    const error: any = response.data.error[0];
                    if (error && typeof (error) === "string") {
                        if (error.includes("Unable") && error.includes("api.yelowtaxi.com")) {
                            onFailure(Strings.please_check_internet)
                        } else {
                            onFailure(error)
                        }
                    } else {
                        onFailure(Strings.something_went_wrong)
                    }

                    if (error) {
                        dataDogAttr.errorMsg = error.toString()
                    }
                }
            } else {
                onFailure(Strings.something_went_wrong)
            }
        }).catch(error => {

            dataDogAttr.duration = `${new Date().getTime() - currentDate}ms`
            console.log(`------------------ Error of ${endpoint} -------------------`)
            console.log(JSON.stringify(error));


            if (error) {
                if (error.response) {
                    console.log('Error', error.response.data);
                    dataDogAttr.status_code = error.response.status
                    dataDogAttr.errorMsg = error.response.data.toString()

                    switch (error.response.status) {

                        case 401:

                            // onFailure('Session expired')

                            break;

                        default:
                            onFailure(Strings.something_went_wrong)
                            dataDogAttr.errorMsg = error.message
                            break

                    }
                } else if (error.message) {
                    if (error.code && error.code == 'ECONNABORTED') {
                    }

                    onFailure(Strings.something_went_wrong)
                    dataDogAttr.errorMsg = error.message.toString()
                }

            } else {
                onFailure(Strings.something_went_wrong)
                dataDogAttr.errorMsg = Strings.something_went_wrong
            }
        })
    }

    return source
}

export default apiCall;