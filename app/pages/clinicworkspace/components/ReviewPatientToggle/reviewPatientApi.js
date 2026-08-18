import { RTKQueryApi } from '../../../../redux/api/baseApi';
import { tagTypes as tideDashboardTagTypes } from '../../TideDashboardV2/tideDashboardApi';
import { tagTypes as patientDrawerTagTypes } from '../../../../components/PatientDrawer/patientDrawerApi';

const { TIDE_DASHBOARD_PATIENTS } = tideDashboardTagTypes;
const { PATIENT_DRAWER_PATIENT } = patientDrawerTagTypes;

const reviewPatientApi = RTKQueryApi.injectEndpoints({
  endpoints: (builder) => ({
    markPatientReviewed: builder.mutation({
      query: ({ clinicId, patientId }) => ({
        url: `/clinics/${clinicId}/patients/${patientId}/reviews`,
        method: 'PUT',
      }),
      extraOptions: { maxRetries: 0 },
      invalidatesTags: [TIDE_DASHBOARD_PATIENTS, PATIENT_DRAWER_PATIENT],
    }),
    undoPatientReviewed: builder.mutation({
      query: ({ clinicId, patientId }) => ({
        url: `/clinics/${clinicId}/patients/${patientId}/reviews`,
        method: 'DELETE',
      }),
      extraOptions: { maxRetries: 0 },
      invalidatesTags: [TIDE_DASHBOARD_PATIENTS, PATIENT_DRAWER_PATIENT],
    }),
  }),
});

export const {
  useMarkPatientReviewedMutation,
  useUndoPatientReviewedMutation,
} = reviewPatientApi;
