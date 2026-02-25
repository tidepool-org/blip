import { useSelector } from 'react-redux';
import { useLocalStorage } from '../../core/hooks';
import without from 'lodash/without';

export const defaultFilterState = {
  timeCGMUsePercent: null,
  lastData: null,
  lastDataType: null,
  timeInRange: [],
  meetsGlycemicTargets: true,
  patientTags: [],
  clinicSites: [],
};

const useClinicPatientsFilters = () => {
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);

  const activeFiltersStorageKey = `activePatientFilters/${loggedInUserId}/${selectedClinicId}`;
  const [activeFilters, setActiveFilters] = useLocalStorage(activeFiltersStorageKey, defaultFilterState, true);

  const activeFiltersCount = without([
    activeFilters.timeCGMUsePercent,
    activeFilters.lastData,
    activeFilters.clinicSites?.length,
    activeFilters.timeInRange?.length,
    activeFilters.patientTags?.length,
  ], null, 0, undefined).length;

  return [
    activeFilters,
    setActiveFilters,
    activeFiltersCount,
  ];
};

export default useClinicPatientsFilters;
