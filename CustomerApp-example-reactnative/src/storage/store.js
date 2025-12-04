import AsyncStorage from "@react-native-async-storage/async-storage";
import { persistStore, persistReducer } from "redux-persist";
import { configureStore } from "@reduxjs/toolkit";
import { Reducer } from "./reducer";

// redux persist config
const persistConfig = {
    key : 'root',
    storage: AsyncStorage,
};

//  middleware: Redux persist persisted reducer
 const persistedReducer = persistReducer(persistConfig, Reducer);

//  redux: store
const store = configureStore({
    reducer : persistedReducer,
    middleware: getDefaultMiddleware => 
        getDefaultMiddleware({
            immutableCheck: false,
            serializableCheck: false,
        }),
});

//  middleware: Redux persist persisted
let persister = persistStore(store);

// export
export {store, persister};