import { RTKQueryApi } from '../../../redux/api/baseApi';

export const buildGetDeviceIssuesPatientsParams = (offset, limit, category, tags = [], sites = []) => {
  const formattedTags = tags.length > 0 ? tags.join(',') : undefined;
  const formattedSites = sites.length > 0 ? sites.join(',') : undefined;

  return {
    offset,
    limit,
    category,
    tags: formattedTags,
    sites: formattedSites,
  };
};

const deviceIssuesApi = RTKQueryApi.injectEndpoints({
  endpoints: (builder) => ({
    getDeviceIssuesPatients: builder.query({
      query: ({ clinicId, offset, limit, category, tags, sites }) => {
        const params = buildGetDeviceIssuesPatientsParams(offset, limit, category, tags, sites);

        return {
          url: `/clinics/${clinicId}/patients`,
          params,
        };
      },
    }),
  }),
});

export const { useGetDeviceIssuesPatientsQuery } = deviceIssuesApi;
