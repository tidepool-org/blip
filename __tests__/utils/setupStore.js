import { configureStore } from '@reduxjs/toolkit';
import { RTKQueryApi } from '@app/redux/api/baseApi';

export const setupStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      [RTKQueryApi.reducerPath]: RTKQueryApi.reducer,
    },
    middleware: (getDefaultMiddleware) => ([
      ...getDefaultMiddleware(),
      RTKQueryApi.middleware,
    ]),
    preloadedState,
  });
};
