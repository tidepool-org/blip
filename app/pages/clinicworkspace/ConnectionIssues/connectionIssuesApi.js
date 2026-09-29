import { RTKQueryApi } from '../../../redux/api/baseApi';
import { CATEGORY } from './filters/FilterByCategory';

const getConnectionIssuesParam = (category) => {
  switch(category) {
    case CATEGORY.STALE_DATA:
      return ['staleData'];
    case CATEGORY.ERROR_OR_DC:
      return ['disconnected', 'error'];
    case CATEGORY.INVITE_SENT:
      return ['staleInvite'];
    case CATEGORY.INVITE_EXPIRED:
      return ['expiredInvite'];
    case CATEGORY.HIDDEN:
    case CATEGORY.DEFAULT:
      return [
        'staleData',
        'disconnected',
        'error',
        'staleInvite',
        'expiredInvite',
      ];
    default:
      return undefined;
  }
};

export const LIMIT = 12;

const connectionIssuesApi = RTKQueryApi.injectEndpoints({
  endpoints: (builder) => ({
    getConnectionIssuesPatients: builder.query({
      query: ({ clinicId, offset, category, limit }) => {
        const connectionIssueCauses = getConnectionIssuesParam(category);
        const onlyHiddenConnectionIssues = category === CATEGORY.HIDDEN || undefined;

        return {
          url: `/clinics/${clinicId}/patients`,
          params: {
            offset,
            limit,
            connectionIssueCauses,
            onlyHiddenConnectionIssues,
          },
        };
      },
    }),
  }),
});

export const { useGetConnectionIssuesPatientsQuery } = connectionIssuesApi;
