import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import config from '../../config';
import { keycloak } from '../../keycloak';
import tidepoolApi from '../../core/api';

export const RTKQueryApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: `${config.API_HOST}/v1/`,
    prepareHeaders: (headers) => {
      if (keycloak?.token) {
        headers.set('x-tidepool-session-token', keycloak?.token);
      }

      if (tidepoolApi.tidepool?.getSessionTrace()) {
        headers.set('x-tidepool-trace-session', tidepoolApi.tidepool.getSessionTrace());
      }

      return headers;
    },
  }),
  endpoints: () => ({}),
});
