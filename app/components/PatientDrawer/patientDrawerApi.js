import { RTKQueryApi } from '../../redux/api/baseApi';

export const tagTypes = {
  PATIENT_DRAWER_PATIENT: 'PATIENT_DRAWER_PATIENT',
};

const { PATIENT_DRAWER_PATIENT } = tagTypes;

RTKQueryApi.enhanceEndpoints({
  addTagTypes: [PATIENT_DRAWER_PATIENT],
});

const patientDrawerApi = RTKQueryApi.injectEndpoints({
  endpoints: (builder) => ({
    getPatientDrawerPatient: builder.query({
      query: ({ clinicId, patientId }) => ({
        url: `/clinics/${clinicId}/patients/${patientId}`,
      }),
      providesTags: [PATIENT_DRAWER_PATIENT],
    }),
  }),
});

export const {
  useGetPatientDrawerPatientQuery,
} = patientDrawerApi;
