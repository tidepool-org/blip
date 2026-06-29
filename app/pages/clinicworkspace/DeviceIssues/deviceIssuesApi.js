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

const deviceIssuesApi = RTKQueryApi.injectEndpoints({
  endpoints: (builder) => ({
    getDeviceIssuesPatients: builder.query({
      query: ({ clinicId, offset, category, limit }) => {
        const deviceIssues = getDeviceIssuesParam(category);
        const omitHiddenDevicesIssues = category !== CATEGORY.HIDDEN;

        return {
          url: `/clinics/${clinicId}/patients`,
          params: {
            offset,
            limit,
            deviceIssues,
            omitHiddenDevicesIssues,
          },
        };
      },
    }),
  }),
});

export const { useGetDeviceIssuesPatientsQuery } = deviceIssuesApi;
