import { RTKQueryApi } from '../../../redux/api/baseApi';

export const buildGetTideDashboardPatientsParams = (offset, limit, category, tags = []) => {
  const formattedTags = tags.length > 0 ? tags.join(',') : undefined;

  return {
    offset,
    limit,
    category,
    tags: formattedTags,
  };
};


const tideDashboardApi = RTKQueryApi.injectEndpoints({
  endpoints: (builder) => ({
    getTideDashboardPatients: builder.query({
      query: ({ clinicId, offset, category, tags, limit }) => {
        const params = buildGetTideDashboardPatientsParams(offset, limit, category, tags);

        return {
          url: `/clinics/${clinicId}/patients`,
          params,
        };
      },
    }),
  }),
});

export const { useGetTideDashboardPatientsQuery } = tideDashboardApi;
