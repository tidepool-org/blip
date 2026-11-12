import omitBy from 'lodash/omitBy';
import isNil from 'lodash/isNil';

import { RTKQueryApi, RETRY_COUNT, filenameFromMeta } from '../../api/baseApi';

// A 4xx is a final answer: 403 (not admin of both workspaces) or 400 (plan prevents the merge).
const retryCondition = (error, _args, { attempt }) =>
  !(error?.status >= 400 && error?.status < 500) && attempt <= RETRY_COUNT;

const workspaceMergeApi = RTKQueryApi.injectEndpoints({
  endpoints: (builder) => ({
    // Omitting sourceId asks for the single-workspace duplicates report.
    generateMergeReport: builder.mutation({
      query: ({ targetId, sourceId }) => ({
        url: `clinics/${targetId}/reports/merge`,
        method: 'POST',
        body: sourceId ? { sourceId } : {},
        responseHandler: (response) => response.blob(),
      }),
      transformResponse: (blob, meta) => ({
        blob,
        filename: filenameFromMeta(meta, 'Merge Report.xlsx'),
      }),
      extraOptions: { retryCondition },
    }),

    mergeClinic: builder.mutation({
      // The service rejects a merge from a user session unless `confirmed` is true.
      query: ({ targetId, sourceId, sourcePatientTag, sourcePatientSite, confirmed }) => ({
        url: `clinics/${targetId}/merge`,
        method: 'POST',
        body: omitBy({ sourceId, sourcePatientTag, sourcePatientSite, confirmed }, isNil),
      }),
      // Sent once: a retry after a lost response would run against an already-deleted source.
      extraOptions: { maxRetries: 0 },
    }),
  }),
});

export const { useGenerateMergeReportMutation, useMergeClinicMutation } = workspaceMergeApi;

export default workspaceMergeApi;
