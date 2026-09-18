import { RTKQueryApi } from '../../../redux/api/baseApi';
import { CATEGORY } from './filters/FilterByCategory';

export const ISSUE_TYPE = {
  STALE_DATA: 'staleData',
  DISCONNECTED: 'disconnected',
  ERRORING: 'erroring',
  STALE_CONNECTION_INVITATION: 'staleConnectionInvitation',
  EXPIRED_CONNECTION_INVITATION: 'expiredConnectionInvitation',
};

const { STALE_DATA, DISCONNECTED, ERRORING,  EXPIRED_CONNECTION_INVITATION, STALE_CONNECTION_INVITATION } = ISSUE_TYPE;

const getConnectionIssuesParam = (category) => {
  switch(category) {
    case CATEGORY.STALE_DATA:
      return [STALE_DATA];
    case CATEGORY.ERROR_OR_DC:
      return [DISCONNECTED, ERRORING];
    case CATEGORY.INVITE_SENT:
      return [STALE_CONNECTION_INVITATION];
    case CATEGORY.INVITE_EXPIRED:
      return [EXPIRED_CONNECTION_INVITATION];
    case CATEGORY.HIDDEN:
    case CATEGORY.DEFAULT:
      return [
        STALE_DATA,
        DISCONNECTED,
        ERRORING,
        STALE_CONNECTION_INVITATION,
        EXPIRED_CONNECTION_INVITATION,
      ];
    default:
      return undefined;
  }
};

export const buildGetConnectionIssuesPatientsParams = (offset, limit, category, tags = [], sites = []) => {
  const deviceIssues = getConnectionIssuesParam(category);
  const omitHiddenDevicesIssues = category !== CATEGORY.HIDDEN;

  const formattedTags = tags?.length > 0 ? tags.join(',') : undefined;
  const formattedSites = sites?.length > 0 ? sites.join(',') : undefined;

  return {
    offset,
    limit,
    deviceIssues,
    omitHiddenDevicesIssues,
    tags: formattedTags,
    sites: formattedSites,
  };
};

export const tagTypes = {
  CONNECTION_ISSUES_PATIENTS: 'CONNECTION_ISSUES_PATIENTS',
};

const { CONNECTION_ISSUES_PATIENTS } = tagTypes;

RTKQueryApi.enhanceEndpoints({
  addTagTypes: [CONNECTION_ISSUES_PATIENTS],
});

const connectionIssuesApi = RTKQueryApi.injectEndpoints({
  endpoints: (builder) => ({
    getConnectionIssuesPatients: builder.query({
      query: ({ clinicId, offset, category, limit, tags, sites }) => {
        const params = buildGetConnectionIssuesPatientsParams(offset, limit, category, tags, sites);

        return {
          url: `/clinics/${clinicId}/patients`,
          params,
        };
      },
      transformResponse: (response, _meta, arg) => ({
        ...response,
        category: arg.category,
      }),
      providesTags: [CONNECTION_ISSUES_PATIENTS],
    }),
  }),
});

export const { useGetConnectionIssuesPatientsQuery } = connectionIssuesApi;
