export interface LanguageList {
    language_list: LanguageModel[]
}

export interface LanguageModel {
    language_id: string;
    name: string;
    keyword: string;
    language_name: string;
    language_code?: string
}
export interface MQTTResponse {
    eventName: string;
    to_id: string;
    company_id: string;
    body: string;
    trip_id: string
}