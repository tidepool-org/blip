import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import config from '../../config';
import { keycloak } from '../../keycloak';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: `${config.API_HOST}/v1/`,
    prepareHeaders: (headers) => {
      headers.set('x-tidepool-session-token', keycloak?.token || '');

      return headers;
    },
  }),
  endpoints: () => ({}),
});
