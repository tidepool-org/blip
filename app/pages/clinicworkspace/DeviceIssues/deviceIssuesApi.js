import { RTKQueryApi } from '../../../redux/api/baseApi';

export const CACHE_TAGS = {
  DEVICE_ISSUES_PATIENTS: 'DEVICE_ISSUES_PATIENTS',
};

RTKQueryApi.enhanceEndpoints({
  addTagTypes: [CACHE_TAGS.DEVICE_ISSUES_PATIENTS],
});

const deviceIssuesApi = RTKQueryApi.injectEndpoints({
  endpoints: (builder) => ({
    getDeviceIssuesPatients: builder.query({
      query: ({ clinicId, offset, category, limit }) => {
        return {
          url: `/clinics/${clinicId}/patients`,
          params: { offset, category, limit },
        };
      },
      providesTags: [CACHE_TAGS.DEVICE_ISSUES_PATIENTS],
    }),
  }),
});

export const { useGetDeviceIssuesPatientsQuery } = deviceIssuesApi;
