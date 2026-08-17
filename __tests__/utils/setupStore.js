import { configureStore } from '@reduxjs/toolkit';
import { RTKQueryApi } from '@app/redux/api/baseApi';

export const setupStore = (preloadedState = {}, additionalReducers = {}) => {
  return configureStore({
    reducer: {
      [RTKQueryApi.reducerPath]: RTKQueryApi.reducer,
      ...additionalReducers,
    },
    middleware: (getDefaultMiddleware) => ([
      ...getDefaultMiddleware(),
      RTKQueryApi.middleware,
    ]),
    preloadedState,
  });
};
