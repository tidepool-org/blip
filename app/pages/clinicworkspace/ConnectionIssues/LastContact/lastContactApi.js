import { RTKQueryApi } from '../../../../redux/api/baseApi';
import { tagTypes as connectionIssuesTagTypes } from '../connectionIssuesApi';

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
