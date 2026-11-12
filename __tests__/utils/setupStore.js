import { configureStore } from '@reduxjs/toolkit';
import { RTKQueryApi } from '@app/redux/api/baseApi';

export const setupStore = (preloadedState = {}, extraReducers = {}) => {
  return configureStore({
    reducer: {
      [RTKQueryApi.reducerPath]: RTKQueryApi.reducer,
      ...extraReducers,
    },
    middleware: (getDefaultMiddleware) => ([
      ...getDefaultMiddleware(),
      RTKQueryApi.middleware,
    ]),
    preloadedState,
  });
};
