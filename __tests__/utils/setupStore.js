import { configureStore } from '@reduxjs/toolkit';
import { RTKQueryApi } from '@app/redux/api/baseApi';

export const setupStore = (preloadedState = {}, extraReducers = {}) => {
  return configureStore({
    reducer: {
      ...extraReducers,
      [RTKQueryApi.reducerPath]: RTKQueryApi.reducer,
    },
    middleware: (getDefaultMiddleware) => ([
      ...getDefaultMiddleware(),
      RTKQueryApi.middleware,
    ]),
    preloadedState,
  });
};
