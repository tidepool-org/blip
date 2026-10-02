import { RTKQueryApi } from '../../api/baseApi';

const cliniciansApi = RTKQueryApi.injectEndpoints({
  endpoints: (builder) => ({
    // The platform endpoint returns the full clinician roster for a clinic (404 -> empty array).
    getCliniciansForClinic: builder.query({
      query: (clinicId) => `clinics/${clinicId}/clinicians?limit=1000&offset=0`,
    }),
  }),
});

export const { useGetCliniciansForClinicQuery } = cliniciansApi;
