import React from 'react';
import noop from 'lodash/noop';

import CGMUseFilterDropdown from '../components/CGMUseFilterDropdown';

const FilterByCGMUse = ({
  activeFilters = {},
  setActiveFilters = noop,
}) => {
  const handleChange = (timeCGMUsePercent) => {
    setActiveFilters({ ...activeFilters, timeCGMUsePercent });
  };

  const { timeCGMUsePercent } = activeFilters;

  return (
    <CGMUseFilterDropdown
      onChange={handleChange}
      timeCGMUsePercent={timeCGMUsePercent}
    />
  );
};

export default FilterByCGMUse;
