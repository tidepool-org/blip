import React from 'react';
import noop from 'lodash/noop';

import DataRecencyFilterDropdown from '../components/DataRecencyFilterDropdown';

const FilterByDataRecency = ({
  activeFilters = {},
  setActiveFilters = noop,
}) => {
  const handleChange = ({ lastData, lastDataType }) => {
    setActiveFilters({ ...activeFilters, lastData, lastDataType });
  };

  const { lastData, lastDataType } = activeFilters;

  return (
    <DataRecencyFilterDropdown
      onChange={handleChange}
      lastData={lastData}
      lastDataType={lastDataType}
    />
  );
};

export default FilterByDataRecency;
