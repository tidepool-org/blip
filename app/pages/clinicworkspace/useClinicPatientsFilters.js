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

// If we HTTP GET `/patients` without a sites/tags query arg, we receive a list of PwDs with zero
// or many sites/tags. We need to pass an explicit argument to request PwDs with exactly zero
// sites/tags. By setting the filter to `['_']`, the query path is set to `/patients?sites=_` or
// `/patients?tags=_`, which the backend understands as a request for PwDs with zero sites/tags
export const SPECIAL_FILTER_STATES = {
  ZERO_SITES: ['_'],
  ZERO_TAGS: ['_'],
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
