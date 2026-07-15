import React from 'react';
import noop from 'lodash/noop';

import TimeInRangeFilterDropdown from '../components/TimeInRangeFilterDropdown';

const FilterByTimeInRange = ({
  activeFilters = {},
  setActiveFilters = noop,
}) => {
  const handleChange = (timeInRange) => {
    setActiveFilters({ ...activeFilters, timeInRange });
  };

  const { timeInRange } = activeFilters;

  return (
    <TimeInRangeFilterDropdown
      onChange={handleChange}
      timeInRange={timeInRange}
    />
  );
};

export default FilterByTimeInRange;
