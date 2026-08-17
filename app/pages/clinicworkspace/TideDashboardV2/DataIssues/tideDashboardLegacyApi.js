import { RTKQueryApi } from '../../../../redux/api/baseApi';
import { tagTypes } from '../tideDashboardApi';

// This file isolates legacy TIDE Dashboard API calls (the V1
// `/v1/clinics/:clinicId/tide_report` endpoint) so they are not entangled with
// the new V2 endpoints in `tideDashboardApi`. It shares the primary
// `RTKQueryApi` instance (so no additional store wiring is required), but should
// be kept separate from new work. Prefer `tideDashboardApi` for all new code.

const { TIDE_DASHBOARD_PATIENTS } = tagTypes;

export const buildGetTideReportParams = (period, lastData, tags = [], lastDataCutoff, categories = []) => {
  const formattedTags = tags.length > 0 ? tags.join(',') : undefined;
  const formattedCategories = categories.length > 0 ? categories.join(',') : undefined;

  return {
    period,
    lastData,
    tags: formattedTags,
    lastDataCutoff,
    categories: formattedCategories,
  };
};

const tideDashboardLegacyApi = RTKQueryApi.injectEndpoints({
  endpoints: (builder) => ({
    getTideReport: builder.query({
      query: ({ clinicId, period, lastData, tags, lastDataCutoff, categories }) => {
        const params = buildGetTideReportParams(period, lastData, tags, lastDataCutoff, categories);

        return {
          url: `/clinics/${clinicId}/tide_report`,
          params,
        };
      },
      // The tide_report response groups patients by category. The "Data Issues"
      // table only renders the `noData` group. We flatten each entry so that the
      // row === patient (matching how the V2 table cells consume rows), keeping
      // the top-level `lastData` needed to derive days since last data.
      transformResponse: (response) => {
        const noData = response?.results?.noData || [];

        return {
          patients: noData.map(({ patient, lastData }) => ({ ...patient, lastData })),
        };
      },
      providesTags: [TIDE_DASHBOARD_PATIENTS],
    }),
    getPatientFromClinic: builder.query({
      queryFn: async ({ clinicId, patientId }, _queryApi, _extraOptions, baseQuery) => {
        if (!patientId) return { data: null };

        return baseQuery({ url: `/clinics/${clinicId}/patients/${patientId}` });
      },
      providesTags: [TIDE_DASHBOARD_PATIENTS],
    }),
  }),
});

export const { useGetTideReportQuery, useGetPatientFromClinicQuery } = tideDashboardLegacyApi;
