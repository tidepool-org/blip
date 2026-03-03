import { RTKQueryApi } from '../../../redux/api/baseApi';

const tideDashboardApi = RTKQueryApi.injectEndpoints({
  endpoints: (builder) => ({
    getTideDashboardPatients: builder.query({
      query: ({ clinicId, offset, category, limit }) => {
        return {
          url: `/clinics/${clinicId}/patients`,
          params: { offset, category, limit },
        };
      },
    }),
  }),
});

export const { useGetTideDashboardPatientsQuery } = tideDashboardApi;
