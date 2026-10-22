import React from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';

import CGMUseFilterDropdown from '../components/filters/CGMUseFilterDropdown';

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

FilterByCGMUse.propTypes = {
  activeFilters: PropTypes.shape({
    timeCGMUsePercent: PropTypes.string,
  }),
  setActiveFilters: PropTypes.func,
};

export default FilterByCGMUse;
