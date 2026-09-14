import { RTKQueryApi } from '../../api/baseApi';
import { fetchKeycloakCredentials, mapKeycloakCredentialsToMfaStatus } from '../../../keycloak';

const mfaStatusApi = RTKQueryApi.injectEndpoints({
  endpoints: (builder) => ({
    getMfaStatus: builder.query({
      // Keycloak's account/credentials endpoint sits on a different host and auth scheme
      // than the platform baseQuery, so this endpoint uses a custom queryFn. RTK Query does
      // not run transformResponse for queryFn endpoints, so the credentials -> mfaStatus
      // mapping happens here.
      queryFn: async () => {
        try {
          const credentials = await fetchKeycloakCredentials();
          return { data: mapKeycloakCredentialsToMfaStatus(credentials) };
        } catch (err) {
          return { error: { status: err.status ?? 'CUSTOM_ERROR', data: err.message } };
        }
      },
      providesTags: ['MfaStatus'],
    }),
  }),
});

export const { useGetMfaStatusQuery } = mfaStatusApi;
