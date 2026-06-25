import { RTKQueryApi } from '../../../redux/api/baseApi';
import { CATEGORY } from './FilterByCategory';

const getDeviceIssuesParam = (category) => {
  switch(category) {
    case CATEGORY.DEFAULT: return 'all'; // TODO: FIX
    case CATEGORY.STALE_DATA: return 'staleData';
    case CATEGORY.DISCONNECTED: return 'disconnected';
    case CATEGORY.ERRORING: return 'erroring';
    case CATEGORY.INVITE_STALE: return 'staleConnectionInvitation';
    case CATEGORY.INVITE_EXPIRED: return 'expiredConnectionInvitation';
  }

  return undefined;
};

const deviceIssuesApi = RTKQueryApi.injectEndpoints({
  endpoints: (builder) => ({
    getDeviceIssuesPatients: builder.query({
      query: ({ clinicId, offset, category, limit }) => {
        const deviceIssues = getDeviceIssuesParam(category);

        return {
          url: `/clinics/${clinicId}/patients`,
          params: { offset, deviceIssues, limit },
        };
      },
    }),
  }),
});

export const { useGetDeviceIssuesPatientsQuery } = deviceIssuesApi;
