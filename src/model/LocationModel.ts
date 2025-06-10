export interface PlaceAutoPredictionModel {
    placeId?: string;
    full_text?: string;
    primary_text?: string;
    latitude?: number;
    longitude?: number;
    address?: string;
}
export interface RouteTrip {
    routeName: string;
    tripId: string;
    distance: number;
    time: number;
    date: string;
    locations: Place[];
    updatedAt: string;
    isOptimized?: boolean;
    isOptimizing?: boolean;
    requestOptimize?: boolean;
    extraCricuitData?: any;
    tripStatus?: 'not_started' | 'started' | 'completed' | 'cancelled';
    startTime?: string;
    endTime?: string;
}

export interface Place {
    id?: number;
    title?: string;
    subtitle?: string;
    placeId?: string;
    latitude?: number;
    longitude?: number;
    packageCount?: number;
    orderType?: 'first' | 'auto' | 'last';
    stopType?: 'delivery' | 'pickup';
    uniqueId?: string;
    isCompleted?: boolean;
    deliveryTime?: string;
    status?: 'failed' | 'delivered' | 'pickuped';
    statusUpdateTime?: string;
    packageFinder?: PackageFinderData;
    arrivalTime?: ArrivalTimeType;
    timeAtStop?: TimeAtStopType;
    locationNotes?: string;
}

export interface PlaceItem {
    placeId: string;
    primary_text: string;
    secondary_text: string;
    full_text: string;
    latitude: number;
    longitude: number;
    distance?: number;
    duration?: number;
}

export interface PackageFinderData {
    size?: PackageFinderSize;
    type?: PackageFinderType;
    position?: PackageFinderPosition;
}

export interface PackageFinderPosition {
    horizontal?: PackageFinderHorizontal;
    leftRight?: PackageFinderLeftRight;
    heightPosition?: PackageFinderHeightPosition;
}

export interface ArrivalTimeType {
    from?: string;
    to?: string;
}

export interface TimeAtStopType {
    minutes?: number;
    seconds?: number;
}

export interface Preferences {
    theme: string;
    distanceUnit: string;
    averageTimeAtStop: TimeAtStopType;
    vehicleType: string;
    avoidTolls: boolean;
    packageId: boolean;
    navigationModeBubble: boolean;
    navigationApp: string;
    stopSide: string;
}

export type PackageFinderSize = 'Small' | 'Medium' | 'Large';
export type PackageFinderType = 'Box' | 'Bag' | 'Letter';
export type PackageFinderHorizontal = 'Front' | 'Middle' | 'Back';
export type PackageFinderLeftRight = 'Left' | 'Right';
export type PackageFinderHeightPosition = 'Floor' | 'Shelf';