import React from 'react';
import { useSelector } from 'react-redux';
import without from 'lodash/without';

const useActiveFiltersCount = () => {
  const { patientTags, clinicSites } = useSelector(state => state.blip.tideDashboardFilters);

  const count = without([
    patientTags?.length,
    clinicSites?.length,
  ], null, 0, undefined).length;

  return count;
};

export default useActiveFiltersCount;
