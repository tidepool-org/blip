import { RTKQueryApi } from '../../../redux/api/baseApi';
import { CATEGORY } from './tideDashboardSlice';
import CGMExclusionQuery from './CGMExclusionQuery';

// Each rule matches a category and automatically negates all preceding
// rules, ensuring patients appear in at most one category.
//
export const tideDashboardExclusionQueryParams = new CGMExclusionQuery()
  .addRule(CATEGORY.VERY_LOW, 'cgm.timeInVeryLowPercent', '>=', 0.01)         // queries >=0.005
  .addRule(CATEGORY.ANY_LOW, 'cgm.timeInAnyLowPercent', '>=', 0.04)           // queries >=0.035
  .addRule(CATEGORY.DROP_IN_TIR, 'cgm.timeInTargetPercentDelta', '<=', -0.15) // queries <=-0.145
  .addRule(CATEGORY.ANY_HIGH, 'cgm.timeInAnyHighPercent', '>=', 0.25)         // queries >=0.245
  .addRule(CATEGORY.VERY_HIGH, 'cgm.timeInVeryHighPercent', '>=', 0.05)       // queries >=0.045
  .addRule(CATEGORY.LOW_CGM_WEAR, 'cgm.timeCGMUsePercent', '<', 0.70)         // queries <0.695
  .addRule(CATEGORY.TARGET, 'cgm.timeCGMUsePercent', '>=', 0.70);             // queries >=0.695 and overwrites previous

export const buildGetTideDashboardPatientsParams = (offset, limit, category, summaryPeriod, lastDataFrom, lastDataTo, tags = [], sites = []) => {
  const formattedTags = tags?.length > 0 ? tags.join(',') : undefined;
  const formattedSites = sites?.length > 0 ? sites.join(',') : undefined;

  const cgmQueryParams = tideDashboardExclusionQueryParams.getQueryParams(category);

  return {
    offset,
    limit,
    period: summaryPeriod,
    'cgm.lastDataTo': lastDataTo,
    'cgm.lastDataFrom': lastDataFrom,
    tags: formattedTags,
    sites: formattedSites,
    ...cgmQueryParams,
  };
};

export const tagTypes = {
  TIDE_DASHBOARD_PATIENTS: 'TIDE_DASHBOARD_PATIENTS',
};

const { TIDE_DASHBOARD_PATIENTS } = tagTypes;

RTKQueryApi.enhanceEndpoints({
  addTagTypes: [TIDE_DASHBOARD_PATIENTS],
});

const tideDashboardApi = RTKQueryApi.injectEndpoints({
  endpoints: (builder) => ({
    getTideDashboardPatients: builder.query({
      query: ({ clinicId, offset, limit, category, summaryPeriod, lastDataFrom, lastDataTo, tags, sites }) => {
        const params = buildGetTideDashboardPatientsParams(offset, limit, category, summaryPeriod, lastDataFrom, lastDataTo, tags, sites);

        return {
          url: `/clinics/${clinicId}/patients`,
          params,
        };
      },
      transformResponse: (response, _meta, arg) => ({
        ...response,
        category: arg.category,
      }),
      providesTags: [TIDE_DASHBOARD_PATIENTS],
    }),
  }),
});

export const {
  useGetTideDashboardPatientsQuery,
} = tideDashboardApi;
