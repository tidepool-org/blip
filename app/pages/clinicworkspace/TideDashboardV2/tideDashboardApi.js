import { RTKQueryApi } from '../../../redux/api/baseApi';

const tideDashboardApi = RTKQueryApi.injectEndpoints({
  endpoints: (builder) => ({
    getTideDashboardPatients: builder.query({
      query: ({ clinicId, offset, category, tags, limit }) => {
        const formattedTags = tags.length > 0 ? tags.join(',') : undefined;

        return {
          url: `/clinics/${clinicId}/patients`,
          params: { offset, category, tags: formattedTags, limit },
        };
      },
    }),
  }),
});

export const { useGetTideDashboardPatientsQuery } = tideDashboardApi;
