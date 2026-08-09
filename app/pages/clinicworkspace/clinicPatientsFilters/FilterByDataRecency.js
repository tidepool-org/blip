import React from 'react';
import PropTypes from 'prop-types';

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

FilterByDataRecency.propTypes = {
  activeFilters: PropTypes.shape({
    lastData: PropTypes.number,
    lastDataType: PropTypes.oneOf(['bgm', 'cgm']),
  }),
  setActiveFilters: PropTypes.func,
};

export default FilterByDataRecency;
