import React from 'react';
import PropTypes from 'prop-types';
import without from 'lodash/without';

import AppliedFilters from './components/AppliedFilters';
import { defaultFilterState } from './useClinicPatientsFilters';

const ActiveFiltersBar = ({ activeFilters, setActiveFilters }) => {
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

      default:
        setActiveFilters({
          ...activeFilters,
          [filterKey]: defaultFilterState[filterKey],
        });
    }
  };

  return (
    <AppliedFilters
      filters={activeFilters}
      onRemoveFilter={handleRemoveFilter}
    />
  );
};

export default ActiveFiltersBar;
