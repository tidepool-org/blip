import { RTKQueryApi } from '../../../redux/api/baseApi';

export const buildGetTideDashboardPatientsParams = (offset, limit, category, lastDataFrom, lastDataTo, tags = []) => {
  const formattedTags = tags.length > 0 ? tags.join(',') : undefined;

  return {
    offset,
    limit,
    category,
    'cgm.lastDataTo': lastDataTo,
    'cgm.lastDataFrom': lastDataFrom,
    tags: formattedTags,
  };
};


const tideDashboardApi = RTKQueryApi.injectEndpoints({
  endpoints: (builder) => ({
    getTideDashboardPatients: builder.query({
      query: ({ clinicId, offset, limit, category, lastDataFrom, lastDataTo, tags }) => {
        const params = buildGetTideDashboardPatientsParams(offset, limit, category, lastDataFrom, lastDataTo, tags);

        return {
          url: `/clinics/${clinicId}/patients`,
          params,
        };
      },
    }),
  }),
});

export const { useGetTideDashboardPatientsQuery } = tideDashboardApi;
