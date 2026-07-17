import React from 'react';

import noop from 'lodash/noop';
import reject from 'lodash/reject';

import { lastDataFilterOptions } from '../../../core/clinicUtils';

import DataRecencyFilterDropdown from '../components/DataRecencyFilterDropdown';

const FilterByDataRecency = ({
  activeFilters = {},
  setActiveFilters = noop,
}) => {
  const handleChange = ({ lastData, lastDataType }) => {
    setActiveFilters({ ...activeFilters, lastData, lastDataType });
  };

  const { lastData, lastDataType } = activeFilters;

  const customLastDataFilterOptions = reject(lastDataFilterOptions, { value: 7 });

  return (
    <DataRecencyFilterDropdown
      onChange={handleChange}
      lastData={lastData}
      lastDataType={lastDataType}
      filterOptions={customLastDataFilterOptions}
    />
  );
};

export default FilterByDataRecency;
