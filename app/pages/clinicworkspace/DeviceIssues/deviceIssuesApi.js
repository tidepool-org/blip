import { RTKQueryApi } from '../../../redux/api/baseApi';
import { CATEGORY } from './FilterByCategory';

const getDeviceIssuesParam = (category) => {
  switch(category) {
    case CATEGORY.STALE_DATA:
      return ['staleData'];
    case CATEGORY.ERROR_OR_DC:
      return ['disconnected', 'erroring'];
    case CATEGORY.INVITE_SENT:
      return ['staleConnectionInvitation'];
    case CATEGORY.INVITE_EXPIRED:
      return ['expiredConnectionInvitation'];
    case CATEGORY.HIDDEN:
    case CATEGORY.DEFAULT:
      return [
        'staleData',
        'disconnected',
        'erroring',
        'staleConnectionInvitation',
        'expiredConnectionInvitation',
      ];
    default:
      return undefined;
  }
};

export const buildGetDeviceIssuesPatientsParams = (offset, limit, category, tags = [], sites = []) => {
  const formattedTags = tags.length > 0 ? tags.join(',') : undefined;
  const formattedSites = sites.length > 0 ? sites.join(',') : undefined;

  const deviceIssues = getDeviceIssuesParam(category);
  const omitHiddenDevicesIssues = category !== CATEGORY.HIDDEN;

  return {
    offset,
    limit,
    tags: formattedTags,
    sites: formattedSites,
    deviceIssues,
    omitHiddenDevicesIssues,
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
