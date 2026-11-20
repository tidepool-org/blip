import { useSelector } from 'react-redux';
import { useGetTideReportQuery } from './tideDashboardLegacyApi';
import useDerivedDataRecencyEndpoints from '../useDerivedDataRecencyEndpoints';

const CATEGORIES = [
  'timeInVeryLowPercent',
  'timeInAnyLowPercent',
  'dropInTimeInTargetPercent',
  'timeInAnyHighPercent',
  'timeInVeryHighPercent',
  'timeCGMUsePercent',
  'meetingTargets',
];

const useTideReportNoDataPatients = () => {
  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);
  const { summaryPeriod, lastData, patientTags, clinicSites } = useSelector(state => state.blip.tideDashboardFilters);

  // `lastDataFrom` is derived identically to V1's `lastDataCutoff`.
  const [lastDataCutoff] = useDerivedDataRecencyEndpoints();

  const result = useGetTideReportQuery(
    {
      clinicId: selectedClinicId,
      period: summaryPeriod,
      lastData,
      tags: patientTags,
      sites: clinicSites,
      lastDataCutoff,
      categories: CATEGORIES,
    },
    { skip: !selectedClinicId }
  );

  return {
    ...result,
    patients: result.data?.patients || [],
  };
};

export default useTideReportNoDataPatients;
