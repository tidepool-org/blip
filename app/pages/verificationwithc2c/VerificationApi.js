import React from 'react';
import { baseUrl, prepareHeaders, RTKQueryApi } from '../../redux/api/baseApi';
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQueryWithManualRedirect = fetchBaseQuery({
  baseUrl: baseUrl,
  prepareHeaders,
  redirect: 'manual',
});

export const VerificationApi = RTKQueryApi.injectEndpoints({
  endpoints: (builder) => ({
    validateRestrictedToken: builder.query({
      async queryFn(arg, api, extraOptions) {
        const { providerName, restrictedToken } = arg;
        const loginUrl = `/oauth/${providerName}/authorize?restricted_token=${restrictedToken}`;

        const result = await baseQueryWithManualRedirect(
          { url: loginUrl, method: 'GET' },
          api,
          extraOptions
        );

        // If the token is valid, server will respond with a redirect to a provider OAuth login page.
        // We stop the process here because we want to manage the redirect ourselves
        if (result?.meta?.response?.type === 'opaqueredirect') {
          return { data: { isValid: true } };
        }

        // If the token is invalid, the server will respond with a 401
        return { data: { isValid: false } };
      },
    }),
  }),
});

export const { useLazyValidateRestrictedTokenQuery } = VerificationApi;
