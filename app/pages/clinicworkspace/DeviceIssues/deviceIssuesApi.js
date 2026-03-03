import { RTKQueryApi } from '../../../redux/api/baseApi';

const deviceIssuesApi = RTKQueryApi.injectEndpoints({
  endpoints: (builder) => ({
    getDeviceIssuesPatients: builder.query({
      query: ({ clinicId, offset, category, limit }) => {
        return {
          url: `/clinics/${clinicId}/patients`,
          params: { offset, category, limit },
        };
      },
    }),
  }),
});

export const { useGetDeviceIssuesPatientsQuery } = deviceIssuesApi;