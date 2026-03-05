import { RTKQueryApi } from '../../../redux/api/baseApi';
import { CATEGORY } from './FilterByCategory';
import CGMExclusionQuery from './CGMExclusionQuery';

// Each rule ensures that rules before it are negated to ensure list deduplication
// For example, a query for ANY_LOW patients will have a param to exclude VERY_LOW patients
const cgmExclusionQuery = new CGMExclusionQuery()
  .addRule(CATEGORY.VERY_LOW,  'cgm.timeInVeryLowPercent',  '>=0.01')
  .addRule(CATEGORY.ANY_LOW,   'cgm.timeInAnyLowPercent',   '>=0.04')
  .addRule(CATEGORY.ANY_HIGH,  'cgm.timeInAnyHighPercent',  '>=0.25')
  .addRule(CATEGORY.VERY_HIGH, 'cgm.timeInVeryHighPercent', '>=0.05');

export const buildGetTideDashboardPatientsParams = (offset, limit, category, tags = []) => {
  const formattedTags = tags.length > 0 ? tags.join(',') : undefined;

  const cgmQueryParams = cgmExclusionQuery.getQueryParams(category);

  return {
    offset,
    limit,
    category,
    tags: formattedTags,
    ...cgmQueryParams,
  };
};


const tideDashboardApi = RTKQueryApi.injectEndpoints({
  endpoints: (builder) => ({
    getTideDashboardPatients: builder.query({
      query: ({ clinicId, offset, category, tags, limit }) => {
        const params = buildGetTideDashboardPatientsParams(offset, limit, category, tags);

        return {
          url: `/clinics/${clinicId}/patients`,
          params,
        };
      },
    }),
  }),
});

export const { useGetTideDashboardPatientsQuery } = tideDashboardApi;
