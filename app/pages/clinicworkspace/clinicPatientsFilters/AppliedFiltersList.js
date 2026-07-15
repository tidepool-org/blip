import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import without from 'lodash/without';

import ActiveFiltersTray from '../components/ActiveFiltersTray';
import { defaultFilterState } from '../useClinicPatientsFilters';
import { Box } from 'theme-ui';

const AppliedFiltersList = ({ activeFilters, setActiveFilters, rightContent }) => {
  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);
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

  const isActive = hasActiveFilters || hasSearchActive;
  const count = clinic?.fetchedPatientCount || 0;

  if (!isActive || count <= 0) return null;

  return (
    <ActiveFiltersTray
      hasSearchActive={hasSearchActive}
      filters={activeFilters}
      onRemoveFilter={handleRemoveFilter}
      rightContent={
        <Box sx={{ fontSize: 0 }}>
          {rightContent}
        </Box>
      }
    />
  );
};

export default AppliedFiltersList;
