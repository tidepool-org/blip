import React from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';

import TimeInRangeFilterDropdown from '../components/filters/TimeInRangeFilterDropdown';

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

FilterByTimeInRange.propTypes = {
  activeFilters: PropTypes.shape({
    timeInRange: PropTypes.arrayOf(PropTypes.string),
  }),
  setActiveFilters: PropTypes.func,
};

export default FilterByTimeInRange;
