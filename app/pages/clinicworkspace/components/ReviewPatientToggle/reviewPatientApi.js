import { RTKQueryApi } from '../../../../redux/api/baseApi';
import { tagTypes as tideDashboardTagTypes } from '../../TideDashboardV2/tideDashboardApi';

const { TIDE_DASHBOARD_PATIENTS } = tideDashboardTagTypes;

const reviewPatientApi = RTKQueryApi.injectEndpoints({
  endpoints: (builder) => ({
    markPatientReviewed: builder.mutation({
      query: ({ clinicId, patientId }) => ({
        url: `/clinics/${clinicId}/patients/${patientId}/reviews`,
        method: 'PUT',
      }),
      invalidatesTags: [TIDE_DASHBOARD_PATIENTS],
    }),
    undoPatientReviewed: builder.mutation({
      query: ({ clinicId, patientId }) => ({
        url: `/clinics/${clinicId}/patients/${patientId}/reviews`,
        method: 'DELETE',
      }),
      invalidatesTags: [TIDE_DASHBOARD_PATIENTS],
    }),
  }),
});

export const {
  useMarkPatientReviewedMutation,
  useUndoPatientReviewedMutation,
} = reviewPatientApi;
