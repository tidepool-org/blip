import { RTKQueryApi, RETRY_COUNT } from '../../redux/api/baseApi';

export const ShareApi = RTKQueryApi.injectEndpoints({
  endpoints: (builder) => ({
    getClinicByShareCode: builder.query({
      query: (shareCode) => `clinics/share_code/${shareCode}`,
      // A 404 means the share code doesn't exist, so retrying only delays the
      // error. Transient failures still get the base query's retries.
      extraOptions: {
        retryCondition: (error, _args, { attempt }) =>
          error.status !== 404 && attempt <= RETRY_COUNT,
      },
    }),
  }),
});

export const { useGetClinicByShareCodeQuery } = ShareApi;
