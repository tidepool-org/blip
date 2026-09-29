import { RTKQueryApi } from '../../../redux/api/baseApi';
import { CATEGORY } from './filters/FilterByCategory';

export const ISSUE_TYPE = {
  STALE_DATA: 'staleData',
  DISCONNECTED: 'disconnected',
  ERROR: 'error',
  STALE_INVITE: 'staleInvite',
  EXPIRED_INVITE: 'expiredInvite',
};

const { STALE_DATA, DISCONNECTED, ERROR, EXPIRED_INVITE, STALE_INVITE } = ISSUE_TYPE;

const getConnectionIssuesParam = (category) => {
  switch(category) {
    case CATEGORY.STALE_DATA:
      return [STALE_DATA];
    case CATEGORY.ERROR_OR_DC:
      return [DISCONNECTED, ERROR];
    case CATEGORY.INVITE_SENT:
      return [STALE_INVITE];
    case CATEGORY.INVITE_EXPIRED:
      return [EXPIRED_INVITE];
    case CATEGORY.HIDDEN:
    case CATEGORY.DEFAULT:
      return [
        STALE_DATA,
        DISCONNECTED,
        ERROR,
        STALE_INVITE,
        EXPIRED_INVITE,
      ];
    default:
      return undefined;
  }
};

export const buildGetConnectionIssuesPatientsParams = (offset, limit, category, tags = [], sites = []) => {
  const connectionIssueCauses = getConnectionIssuesParam(category);
  const onlyHiddenConnectionIssues = category === CATEGORY.HIDDEN || undefined;

  const formattedTags = tags?.length > 0 ? tags.join(',') : undefined;
  const formattedSites = sites?.length > 0 ? sites.join(',') : undefined;

  return {
    offset,
    limit,
    connectionIssueCauses,
    onlyHiddenConnectionIssues,
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
    setConnectionIssueHidden: builder.mutation({
      query: ({ clinicId, patientId, hidden }) => ({
        url: `/clinics/${clinicId}/patients/${patientId}/connection_issue/hidden`,
        method: 'PUT',
        body: { hidden },
      }),
      invalidatesTags: [CONNECTION_ISSUES_PATIENTS],
    }),
  }),
});

export const {
  useGetConnectionIssuesPatientsQuery,
  useSetConnectionIssueHiddenMutation,
} = connectionIssuesApi;
