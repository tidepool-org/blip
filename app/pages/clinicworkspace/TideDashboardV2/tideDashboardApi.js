import { RTKQueryApi } from '../../../redux/api/baseApi';

const tideDashboardApi = RTKQueryApi.injectEndpoints({
  endpoints: (builder) => ({
    getTideDashboardPatients: builder.query({
      query: ({ clinicId, offset, category, lastDataTo, lastDataFrom, tags, limit }) => {
        const formattedTags = tags.length > 0 ? tags.join(',') : undefined;

        return {
          url: `/clinics/${clinicId}/patients`,
          params: {
            offset,
            category,
            'cgm.lastDataTo': lastDataTo,
            'cgm.lastDataFrom': lastDataFrom,
            tags: formattedTags,
            limit,
          },
        };
      },
    }),
  }),
});

export const { useGetTideDashboardPatientsQuery } = tideDashboardApi;
