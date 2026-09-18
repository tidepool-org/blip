import { RTKQueryApi } from '../../api/baseApi';

const patientListExportApi = RTKQueryApi.injectEndpoints({
  endpoints: (builder) => ({
    // Modelled as a mutation rather than a query: each click must hit the server,
    // and the CSV must never be cached or refetched.
    exportPatientList: builder.mutation({
      query: ({ clinicId, period }) => ({
        url: `clinics/${clinicId}/export/patients`,
        params: { period },
        responseHandler: 'text',
      }),
      transformResponse: (csv, meta) => ({
        csv,
        filename: meta?.response?.headers?.get('content-disposition')?.match(/filename="?([^";]+)"?/)?.[1] ?? 'patient-list.csv',
      }),
    }),
  }),
});

export const { useExportPatientListMutation } = patientListExportApi;
