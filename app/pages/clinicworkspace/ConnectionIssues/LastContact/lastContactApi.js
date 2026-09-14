import { RTKQueryApi } from '../../../../redux/api/baseApi';
import { tagTypes as connectionIssuesTagTypes } from '../../TideDashboardV2/tideDashboardApi';

const { CONNECTION_ISSUES_PATIENTS } = connectionIssuesTagTypes;

const lastContactApi = RTKQueryApi.injectEndpoints({
  endpoints: (builder) => ({
    resendInvite: builder.mutation({
      query: ({ clinicId, patientId, providerName }) => ({
        url: `/clinics/${clinicId}/patients/${patientId}/connect/${providerName}`,
        method: 'POST',
      }),
      invalidatesTags: [CONNECTION_ISSUES_PATIENTS],
    }),
  }),
});

export const {
  useResendInviteMutation,
} = lastContactApi;
