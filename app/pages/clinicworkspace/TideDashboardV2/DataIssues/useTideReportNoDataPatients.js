import { useSelector } from 'react-redux';
import { useGetTideReportQuery } from './tideDashboardLegacyApi';
import useDerivedDataRecencyEndpoints from '../useDerivedDataRecencyEndpoints';

// The Data Issues table always requests the report; `categories` is a required
// param on the endpoint, but the `noData` group is returned regardless of which
// category is requested, so we send a single category to satisfy the contract.
const CATEGORIES = ['meetingTargets'];

// Fetches the tide_report and returns the `noData` (Data Issues) patients.
// Both the DataIssues table and the parent (for wiring the row action menu's
// modals) call this; RTK Query dedupes the identical request.
const useTideReportNoDataPatients = () => {
  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);
  const { summaryPeriod, lastData, patientTags } = useSelector(state => state.blip.tideDashboardFilters);

  // `lastDataFrom` is derived identically to V1's `lastDataCutoff`.
  const [lastDataCutoff] = useDerivedDataRecencyEndpoints();

  const result = useGetTideReportQuery(
    {
      clinicId: selectedClinicId,
      period: summaryPeriod,
      lastData,
      tags: patientTags,
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
