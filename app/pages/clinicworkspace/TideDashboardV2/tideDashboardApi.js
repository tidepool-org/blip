import { RTKQueryApi } from '../../../redux/api/baseApi';
import { CATEGORY } from './FilterByCategory';
import CGMExclusionQuery from './CGMExclusionQuery';


// Each rule matches a category and automatically negates all preceding
// rules, ensuring patients appear in at most one category.
//
// We display to the nearest 1%, so each threshold sits at the half-percent rounding
// cutoff (raw 0.005 displays as 1%), matching raw backend values that round to it.
// e.g. A value of 3.7% gets rounded up to 4%, so it needs to be returned when querying >=4%.
const cgmExclusionQuery = new CGMExclusionQuery()
  .addRule(CATEGORY.VERY_LOW, 'cgm.timeInVeryLowPercent', '>=0.005')         // >=1%
  .addRule(CATEGORY.ANY_LOW, 'cgm.timeInAnyLowPercent', '>=0.035')           // >=4%
  .addRule(CATEGORY.DROP_IN_TIR, 'cgm.timeInTargetPercentDelta', '<=-0.145') // <=-15%
  .addRule(CATEGORY.ANY_HIGH, 'cgm.timeInAnyHighPercent', '>=0.245')         // >=25%
  .addRule(CATEGORY.VERY_HIGH, 'cgm.timeInVeryHighPercent', '>=0.045')       // >=5%
  .addRule(CATEGORY.LOW_CGM_WEAR, 'cgm.timeCGMUsePercent', '<0.695')         // <70%
  .addRule(CATEGORY.TARGET, 'cgm.timeCGMUsePercent', '>=0.695');             // >=70% and overwrites previous

export const buildGetTideDashboardPatientsParams = (offset, limit, category, lastDataFrom, lastDataTo, tags = [], sites = []) => {
  const formattedTags = tags.length > 0 ? tags.join(',') : undefined;
  const formattedSites = sites.length > 0 ? sites.join(',') : undefined;

  const cgmQueryParams = cgmExclusionQuery.getQueryParams(category);

  return {
    offset,
    limit,
    category,
    'cgm.lastDataTo': lastDataTo,
    'cgm.lastDataFrom': lastDataFrom,
    tags: formattedTags,
    sites: formattedSites,
    ...cgmQueryParams,
  };
};

const TAGS = {
  TIDE_DASHBOARD_PATIENTS: 'TideDashboardPatients',
};

const { TIDE_DASHBOARD_PATIENTS } = TAGS;

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
      providesTags: [TIDE_DASHBOARD_PATIENTS],
    }),
    setClinicPatientLastReviewed: builder.mutation({
      query: ({ clinicId, patientId }) => ({
        url: `/clinics/${clinicId}/patients/${patientId}/reviews`,
        method: 'PUT',
      }),
      invalidatesTags: [TIDE_DASHBOARD_PATIENTS],
    }),
    revertClinicPatientLastReviewed: builder.mutation({
      query: ({ clinicId, patientId }) => ({
        url: `/clinics/${clinicId}/patients/${patientId}/reviews`,
        method: 'DELETE',
      }),
      invalidatesTags: [TIDE_DASHBOARD_PATIENTS],
    }),
  }),
});

export const {
  useGetTideDashboardPatientsQuery,
  useSetClinicPatientLastReviewedMutation,
  useRevertClinicPatientLastReviewedMutation,
} = tideDashboardApi;
