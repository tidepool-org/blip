import { RTKQueryApi } from '../../../redux/api/baseApi';

export const tagTypes = {
  DEVICE_ISSUES_PATIENTS: 'DEVICE_ISSUES_PATIENTS',
};

const { DEVICE_ISSUES_PATIENTS } = tagTypes;

RTKQueryApi.enhanceEndpoints({
  addTagTypes: [DEVICE_ISSUES_PATIENTS],
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
      providesTags: [DEVICE_ISSUES_PATIENTS],
    }),
  }),
});

export const { useGetDeviceIssuesPatientsQuery } = deviceIssuesApi;
