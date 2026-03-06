import { RTKQueryApi } from '../../../redux/api/baseApi';

export const buildGetDeviceIssuesPatientsParams = (offset, limit, category, tags = []) => {
  const formattedTags = tags.length > 0 ? tags.join(',') : undefined;

  return {
    offset,
    limit,
    category,
    tags: formattedTags,
  };
};

const deviceIssuesApi = RTKQueryApi.injectEndpoints({
  endpoints: (builder) => ({
    getDeviceIssuesPatients: builder.query({
      query: ({ clinicId, offset, limit, category, tags }) => {
        const params = buildGetDeviceIssuesPatientsParams(offset, limit, category, tags);

        return {
          url: `/clinics/${clinicId}/patients`,
          params,
        };
      },
    }),
  }),
});

export const { useGetDeviceIssuesPatientsQuery } = deviceIssuesApi;
