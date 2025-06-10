import React from 'react';
import 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { NativeBaseProvider } from 'native-base';
import { applyMiddleware, createStore, Store } from 'redux';
import reducers from './store/reducers';
import ReduxThunk from 'redux-thunk';
import { persistStore } from 'redux-persist';
import { MenuProvider } from 'react-native-popup-menu';
import AppContainer from './navigation';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { ThemeProvider } from './context/ThemeContext';



// import { pStore, store } from './store/store';
const store: Store = createStore(
    reducers,
    undefined,
    applyMiddleware(ReduxThunk),
);


export const pStore = persistStore(store)
export { store };

function App(): React.JSX.Element {
    return (
        <GestureHandlerRootView style={styles.container}>
            <Provider store={store}>
                <PersistGate persistor={pStore}>
                    <NativeBaseProvider>
                        {/* <MenuProvider> */}
                        <ThemeProvider>
                            <AppContainer />
                        </ThemeProvider>
                        {/* </MenuProvider> */}
                    </NativeBaseProvider>
                </PersistGate>
            </Provider>
        </GestureHandlerRootView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default App