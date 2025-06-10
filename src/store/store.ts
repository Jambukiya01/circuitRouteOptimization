import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import logger from 'redux-logger';
import thunk from 'redux-thunk';
import rootReducer from './reducers';

const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
    whitelist: ['auth'], // Only persist necessary reducers
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore actions with non-serializable values
                ignoredActions: ['persist/PERSIST'],
                // Ignore paths inside state that may contain functions
                ignoredPaths: ['auth.register'],
            },
        }).concat(thunk, logger),
});

export const pStore = persistStore(store);
export { store };