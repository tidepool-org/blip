import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setOffset } from './tideDashboardSlice';
import { setLastDataFilter } from './tideDashboardFiltersSlice';

import { lastDataFilterOptions } from '../../../core/clinicUtils';

import DataRecencyFilterDropdown from '../components/DataRecencyFilterDropdown';

const FilterByDataRecency = () => {
  const dispatch = useDispatch();
  const { lastData } = useSelector(state => state.blip.tideDashboardFilters);

  const handleChange = ({ lastData }) => {
    dispatch(setLastDataFilter(lastData));
    dispatch(setOffset(0));
  };

  const customLastDataFilterOptions = lastDataFilterOptions.filter(opt => [1, 2, 7].includes(opt.value));

  return (
    <DataRecencyFilterDropdown
      onChange={handleChange}
      lastData={lastData}
      lastDataType="cgm" // Fixed to 'cgm' for TIDE Dashboard
      filterOptions={customLastDataFilterOptions}
      canSelectLastDataType={false}
      canClearSelection={false}
    />
  );
};

export default FilterByDataRecency;
