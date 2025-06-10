import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SessionReducer from './SessionReducer';
const persistConfig = {
    key: 'session',
    storage: AsyncStorage,
    whitelist: ["session"]
}

const rootReducer = combineReducers({

    session: SessionReducer

});
const persistedReducer = persistReducer(persistConfig, rootReducer)

// const rootReducer = (state, action) => {
//     if (action.type === HOME_LOGOUT) {
//         state = {}
//     }

//     return appReducer(state, action)
// }

// export default rootReducer
export default (state, action) => {

    return persistedReducer(state, action);
}