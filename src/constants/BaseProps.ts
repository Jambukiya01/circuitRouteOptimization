import { Action } from "../store/actions/CommonActions"
import { SessionState } from "../store/reducers/SessionReducer"

interface BaseProps {
    session: SessionState,
    loading: boolean,
    setSession: (key: string, value: any) => void,
    setLoading: (value: boolean) => void,
    dispatch: (action: Action) => void,
    navigation: any,
    route: { params: any, name: any }
}

export default BaseProps