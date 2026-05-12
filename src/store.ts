// src/store.ts
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "@services/apiSlice";
import authReducer, { authSlice } from "./services/authSlice";
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  persistStore,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import settingsReducer, { settingSlice } from "./services/settingSlice";
import openedDocumentReducer, {
  openedDocumentSlice,
} from './services/openedDocumentSlice';
import presentationInsertReducer, {
  presentationInsertSlice,
} from './store/presentationInsertSlice';
import { errorLoggerMiddleware } from './store/errorLoggerMiddleware';

const localStoragePersistConfig = {
  key: "settings",
  storage: storage,
};

const rootReducers = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  [authSlice.reducerPath]: authReducer,
  [settingSlice.reducerPath]: persistReducer(
    localStoragePersistConfig,
    settingsReducer,
  ),
  [openedDocumentSlice.name]: openedDocumentReducer,
  [presentationInsertSlice.name]: presentationInsertReducer,
});

const rootPersistConfig = {
  key: "root",
  storage: storage,
  whitelist: [settingSlice.reducerPath],
};

const persistedReducer = persistReducer(rootPersistConfig, rootReducers);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(apiSlice.middleware, errorLoggerMiddleware),
});

export type RootState = ReturnType<typeof rootReducers>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export default store;

export const persistor = persistStore(store);
