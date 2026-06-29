import { RTKQueryApi } from '../../../redux/api/baseApi';
import { CATEGORY } from './FilterByCategory';
import CGMExclusionQuery from './CGMExclusionQuery';


// Each rule matches a category and automatically negates all preceding
// rules, ensuring patients appear in at most one category.
const cgmExclusionQuery = new CGMExclusionQuery()
  .addRule(CATEGORY.VERY_LOW,  'cgm.timeInVeryLowPercent',  '>=0.01')
  .addRule(CATEGORY.ANY_LOW,   'cgm.timeInAnyLowPercent',   '>=0.04')
  .addRule(CATEGORY.ANY_HIGH,  'cgm.timeInAnyHighPercent',  '>=0.25')
  .addRule(CATEGORY.VERY_HIGH, 'cgm.timeInVeryHighPercent', '>=0.05');

export const buildGetTideDashboardPatientsParams = (offset, limit, category, lastDataFrom, lastDataTo, tags = [], sites = []) => {
  const formattedTags = tags.length > 0 ? tags.join(',') : undefined;
  const formattedSites = sites.length > 0 ? sites.join(',') : undefined;

  const cgmQueryParams = cgmExclusionQuery.getQueryParams(category);

  return {
    offset,
    limit,
    'cgm.lastDataTo': lastDataTo,
    'cgm.lastDataFrom': lastDataFrom,
    tags: formattedTags,
    sites: formattedSites,
    ...cgmQueryParams,
  };
};


const tideDashboardApi = RTKQueryApi.injectEndpoints({
  endpoints: (builder) => ({
    getTideDashboardPatients: builder.query({
      query: ({ clinicId, offset, limit, category, lastDataFrom, lastDataTo, tags, sites }) => {
        const params = buildGetTideDashboardPatientsParams(offset, limit, category, lastDataFrom, lastDataTo, tags, sites);

        return {
          url: `/clinics/${clinicId}/patients`,
          params,
        };
      },
      transformResponse: (response, _meta, arg) => ({
        ...response,
        category: arg.category,
      }),
    }),
  }),
});

export const { useGetTideDashboardPatientsQuery } = tideDashboardApi;
