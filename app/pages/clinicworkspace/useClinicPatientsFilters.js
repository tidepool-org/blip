import { useSelector } from 'react-redux';
import { useLocalStorage } from '../../core/hooks';

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

  return [
    activeFilters,
    setActiveFilters,
  ];
};

export default useClinicPatientsFilters;
