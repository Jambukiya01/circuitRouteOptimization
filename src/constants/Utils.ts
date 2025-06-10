import Snackbar from 'react-native-snackbar';
import Colors from './Colors';
import moment from 'moment';
import { Platform } from 'react-native';
import { SessionState } from '../store/reducers/SessionReducer';
import { store } from '../App';
import { format, isToday, isYesterday, isTomorrow } from 'date-fns';
import { TimeAtStopType } from '../model/LocationModel';


export default {
    showToast(message: any, duration = Snackbar.LENGTH_LONG, type: "danger" | "success" | "warning" = "success") {

        if (message)
            Snackbar.show({
                text: message.toString(),
                duration: duration,
                backgroundColor: type == "danger" ? "red" : Colors.primaryColor,
                textColor: Colors.Defaultwhite,
            })
    },
    showErrorToast(message: string, duration = 4000) {

        this.showToast(message, duration, 'danger');

    },
    getEncryptedTimeStamp() {
        const max = 999999999
        const min = 111111111
        const plaintext = moment.utc().valueOf() * 2;
        const timestamp1 = plaintext.toString().substring(6, 13)
        const timestamp2 = plaintext.toString().substring(0, 6)
        console.log("plaintext", plaintext, plaintext.toString().length, timestamp1, timestamp2)

        let r = Math.floor(Math.random() * (max - min + 1) + min);
        let r2 = Math.floor(Math.random() * (max - min + 1) + min);
        let r3 = Math.floor(Math.random() * (max - min + 1) + min);
        const finalString = r.toString() + timestamp1 + r2.toString() + timestamp2 + r3.toString()
        console.log("------------RandomFinalString--------------", finalString);
        return finalString
    },
    getDeviceType() {
        return Platform.select({ ios: "I", android: "A" })
    },
    getDateFormat() {
        const session: SessionState = store.getState().session
        // console.log("---HERE DATE FORMET---", session?.company_details?.company_date_format);
        // session.common_config?.format_config?.date_format ||
        return session?.company_details?.company_date_format.toLocaleUpperCase() || "DD, MM YYYY";
    },
    getTimeFormat() {
        const session: SessionState = store.getState().session
        // console.log("---HERE TIME FORMET---", session?.company_details?.company_time_format);
        // session.common_config?.format_config?.time_format ||
        return session.company_details?.company_time_format || "hh:mm A"
    },
    getDateTimeFormat() {
        return `${this.getDateFormat()} , ${this.getTimeFormat()}`
    },
    formatDate(date: any, format = '', isTimeStamp = true) {
        if (!date) {
            console.warn('Empty date input provided to formatDate');
            return '';
        }

        try {
            if (false) {
                return moment(isTimeStamp ? (date > 10000000000 ? date : date * 1000) : date).format(format || this.getDateTimeFormat())
            } else {
                return moment(isTimeStamp ? (date > 10000000000 ? date : date * 1000) : date).locale("en").format(format || this.getDateTimeFormat())
            }
        } catch (error) {
            console.error('Error in formatDate:', error);
            return '';
        }
    },
    formatTime(timeString: Date | string) {
        if (!timeString) return '';

        try {
            const date = new Date(timeString);
            if (isNaN(date.getTime())) {
                console.warn('Invalid date provided to formatTime:', timeString);
                return '';
            }
            return date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        } catch (error) {
            console.error('Error in formatTime:', error);
            return '';
        }
    },
    parseDate(dateInput: string | number): Date {
        try {
            if (!dateInput) {
                console.warn('Empty date input provided to parseDate');
                return new Date(); // Return current date as fallback
            }

            const date = typeof dateInput === 'number'
                ? new Date(dateInput)
                : new Date(Date.parse(dateInput));

            // Check if the date is valid
            if (isNaN(date.getTime())) {
                console.warn('Invalid date parsed in parseDate:', dateInput);
                return new Date(); // Return current date as fallback
            }

            return date;
        } catch (error) {
            console.error('Error in parseDate:', error);
            return new Date(); // Return current date as fallback
        }
    },
    isDateToday(dateInput: string | number): boolean {
        return isToday(this.parseDate(dateInput));
    },
    isDateYesterday(dateInput: string | number): boolean {
        return isYesterday(this.parseDate(dateInput));
    },
    isDateTomorrow(dateInput: string | number): boolean {
        return isTomorrow(this.parseDate(dateInput));
    },
    getFormattedDate(dateInput: string | number): string {
        const date = this.parseDate(dateInput);

        if (this.isDateToday(dateInput)) {
            return 'Today';
        } else if (this.isDateYesterday(dateInput)) {
            return 'Yesterday';
        } else if (this.isDateTomorrow(dateInput)) {
            return 'Tomorrow';
        } else {
            return format(date, 'MMM, dd');
        }
    },
    formatDuration(minutes: number) {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h ? h + "h " : ""}${m ? m + "m" : ""}`.trim();
    },

    decodePolyline(encoded: string) {
        let index = 0, lat = 0, lng = 0;
        const coordinates = [];

        while (index < encoded.length) {
            let shift = 0, result = 0, byte;
            do {
                byte = encoded.charCodeAt(index++) - 63;
                result |= (byte & 0x1F) << shift;
                shift += 5;
            } while (byte >= 0x20);
            const deltaLat = (result & 1) ? ~(result >> 1) : (result >> 1);
            lat += deltaLat;

            shift = 0;
            result = 0;
            do {
                byte = encoded.charCodeAt(index++) - 63;
                result |= (byte & 0x1F) << shift;
                shift += 5;
            } while (byte >= 0x20);
            const deltaLng = (result & 1) ? ~(result >> 1) : (result >> 1);
            lng += deltaLng;

            coordinates.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
        }

        return coordinates;
    },
    getTimeAtStopDisplayText(timeAtStop: TimeAtStopType) {
        if (!timeAtStop || Object.keys(timeAtStop).length === 0) return 'Default (1 min)';
        if (timeAtStop?.minutes === 1 && timeAtStop?.seconds === 0) return 'Default (1 min)';
        return `${timeAtStop?.minutes || 0} min ${timeAtStop?.seconds || 0} sec`;
    },
    getEndTime(): string | null {
        const session: SessionState = store.getState().session
        const trip = session?.current_route_trip;
        const extraData = trip?.extraCricuitData;

        if (!extraData?.startTime || trip?.time == null) {
            return null;
        }
        if (trip?.endTime) {
            return trip.endTime;
        }
        if (extraData.endTime) {
            return extraData.endTime;
        }
        const startTime = new Date(extraData.startTime);
        const durationMinutes = trip.time;
        const calculatedEndTime = new Date(startTime.getTime() + durationMinutes * 60000);
        return calculatedEndTime.toISOString();
    },
    getStartTime(): string | null {
        const session: SessionState = store.getState().session
        const trip = session?.current_route_trip;
        const extraData = trip?.extraCricuitData;

        if (!extraData?.startTime || trip?.time == null) {
            return null;
        }
        if (trip?.startTime) {
            return trip.startTime;
        }
        if (extraData.startTime) {
            return extraData.startTime;
        }
        return new Date().toISOString();
    },
    getDistance(distanceInKm: number, unit: 'Kilometers' | 'Miles'): string {
        let convertedDistance = distanceInKm;
        let unitLabel = 'Km';

        if (unit === 'Miles') {
            convertedDistance = distanceInKm * 0.621371;
            unitLabel = 'Mile';
        }

        const rounded = Math.round(convertedDistance * 100) / 100; // Round to 2 decimal places
        return `${rounded} ${unitLabel}`;
    }




}