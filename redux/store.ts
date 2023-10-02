import { configureStore } from "@reduxjs/toolkit";
import alertReducer from './alertSlice'
import collectionReducer from "./collectionSlice";
import userReducer from './userSlice'
import fileReducer from './fileSlice'
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
  } from 'redux-persist'
import storage from "redux-persist/lib/storage";



  const persistConfig = {
    key: 'root',
    version: 1,
    storage,
  }

  
const persistedUserReducer = persistReducer(persistConfig, userReducer);


export const store = configureStore({
    reducer:{
        alertReducer,
        collectionReducer,
        persistedUserReducer,
        fileReducer,
    },
    middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch