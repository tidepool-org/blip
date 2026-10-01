import { RTKQueryApi } from '../../../redux/api/baseApi';
import { CATEGORY } from './tideDashboardSlice';
import CGMExclusionQuery from './CGMExclusionQuery';

// Each rule matches a category and automatically negates all preceding
// rules, ensuring patients appear in at most one category.

const { VERY_LOW, ANY_LOW, DROP_IN_TIR, ANY_HIGH, VERY_HIGH, LOW_CGM_WEAR, TARGET } = CATEGORY;

export const tideDashboardExclusionQuery = new CGMExclusionQuery()
  .addRule(VERY_LOW, 'cgm.timeInVeryLowPercent', '>=', 0.01)         // queries >=0.005
  .addRule(ANY_LOW, 'cgm.timeInAnyLowPercent', '>=', 0.04)           // queries >=0.035
  .addRule(DROP_IN_TIR, 'cgm.timeInTargetPercentDelta', '<=', -0.15) // queries <=-0.145
  .addRule(ANY_HIGH, 'cgm.timeInAnyHighPercent', '>=', 0.25)         // queries >=0.245
  .addRule(VERY_HIGH, 'cgm.timeInVeryHighPercent', '>=', 0.05)       // queries >=0.045
  .addRule(LOW_CGM_WEAR, 'cgm.timeCGMUsePercent', '<', 0.70)         // queries <0.695
  .addRule(TARGET, 'cgm.timeCGMUsePercent', '>=', 0.70);             // queries >=0.695 and overwrites previous

const getSortArg = (category) => {
  switch(category) {
    case VERY_LOW: return '-timeInVeryLowPercent';
    case ANY_LOW: return '-timeInAnyLowPercent';
    case DROP_IN_TIR: return '+timeInTargetPercentDelta';
    case ANY_HIGH: return '-timeInAnyHighPercent';
    case VERY_HIGH: return '-timeInVeryHighPercent';
    case LOW_CGM_WEAR: return '+timeCGMUsePercent';
    case TARGET: return '-timeInTargetPercent';
    default: return '+fullName';
  }
};

export const buildGetTideDashboardPatientsParams = (offset, limit, category, summaryPeriod, lastDataFrom, lastDataTo, tags = [], sites = []) => {
  const formattedTags = tags?.length > 0 ? tags.join(',') : undefined;
  const formattedSites = sites?.length > 0 ? sites.join(',') : undefined;

  const sort = getSortArg(category);
  const cgmQueryParams = tideDashboardExclusionQuery.getQueryParams(category);

  return {
    offset,
    limit,
    period: summaryPeriod,
    'cgm.lastDataTo': lastDataTo,
    'cgm.lastDataFrom': lastDataFrom,
    tags: formattedTags,
    sites: formattedSites,
    sort: sort,
    sortType: 'cgm',
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
