import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import without from 'lodash/without';

import ActiveFiltersTray from '../components/filters/ActiveFiltersTray';
import ClearFilterButtons, { PATIENT_QUERY_STATE } from '../components/ClearFilterButtons';
import { defaultFilterState } from '../useClinicPatientsFilters';
import { Box } from 'theme-ui';

export const getPatientQueryState = (
  activeFilters = {},
  patientListSearchTextInput = '',
) => {
  const { lastData, lastDataType, timeCGMUsePercent, timeInRange, clinicSites, patientTags } = activeFilters;

  const hasFiltersActive = (
    lastData ||
    lastDataType ||
    timeCGMUsePercent ||
    timeInRange?.length > 0 ||
    clinicSites?.length > 0 ||
    patientTags?.length > 0
  );

  const hasSearchActive = !!patientListSearchTextInput;

  if (hasFiltersActive && hasSearchActive) {
    return PATIENT_QUERY_STATE.FILTER_AND_SEARCH;
  } else if (hasFiltersActive) {
    return PATIENT_QUERY_STATE.FILTER_ONLY;
  } else if (hasSearchActive) {
    return PATIENT_QUERY_STATE.SEARCH_ONLY;
  }

  return PATIENT_QUERY_STATE.NONE;
};

const AppliedFiltersList = ({ activeFilters, setActiveFilters, onClearSearch, onResetFilters }) => {
  const { patientListSearchTextInput } = useSelector(state => state.blip.patientListFilters);

  const handleRemoveFilter = (filterKey, value) => {
    switch (filterKey) {
      case 'lastData':
        setActiveFilters({
          ...activeFilters,
          lastData: defaultFilterState.lastData,
          lastDataType: defaultFilterState.lastDataType,
        });
        break;

      case 'timeInRange':
        setActiveFilters({
          ...activeFilters,
          timeInRange: without(activeFilters.timeInRange, value),
        });
        break;

      case 'patientTags':
        setActiveFilters({
          ...activeFilters,
          patientTags: without(activeFilters.patientTags, value),
        });
        break;

      case 'clinicSites':
        setActiveFilters({
          ...activeFilters,
          clinicSites: without(activeFilters.clinicSites, value),
        });
        break;

      case 'timeCGMUsePercent':
        setActiveFilters({
          ...activeFilters,
          timeCGMUsePercent: defaultFilterState.timeCGMUsePercent,
        });
        break;
    }
  };

  const hasSearchActive = !!patientListSearchTextInput;

  const hasActiveFilters = !!(
    activeFilters.lastData ||
    activeFilters.lastDataType ||
    activeFilters.timeCGMUsePercent ||
    activeFilters.timeInRange?.length > 0 ||
    activeFilters.patientTags?.length > 0 ||
    activeFilters.clinicSites?.length > 0
  );

  const isRendered = hasActiveFilters || hasSearchActive;

  if (!isRendered) return null;

  const patientQueryState = getPatientQueryState(activeFilters, patientListSearchTextInput);

  return (
    <ActiveFiltersTray
      hasSearchActive={hasSearchActive}
      filters={activeFilters}
      onRemoveFilter={handleRemoveFilter}
      rightContent={
        <Box sx={{ fontSize: 0 }}>
          <ClearFilterButtons
            patientQueryState={patientQueryState}
            onClearSearch={onClearSearch}
            onResetFilters={onResetFilters}
          />
        </Box>
      }
    />
  );
};

AppliedFiltersList.propTypes = {
  activeFilters: PropTypes.shape({
    lastData: PropTypes.number,
    lastDataType: PropTypes.oneOf(['bgm', 'cgm']),
    timeCGMUsePercent: PropTypes.oneOf(['<0.7', '>=0.7']),
    timeInRange: PropTypes.arrayOf(PropTypes.string),
    meetsGlycemicTargets: PropTypes.bool,
    patientTags: PropTypes.arrayOf(PropTypes.string),
    clinicSites: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  setActiveFilters: PropTypes.func.isRequired,
  onClearSearch: PropTypes.func.isRequired,
  onResetFilters: PropTypes.func.isRequired,
};

export default AppliedFiltersList;
