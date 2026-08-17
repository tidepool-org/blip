import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import SummaryPeriodFilterDropdown from '../components/SummaryPeriodFilterDropdown';
import { setSummaryPeriodFilter } from './tideDashboardFiltersSlice';
import { setOffset } from './tideDashboardSlice';

const FilterBySummaryPeriod = () => {
  const dispatch = useDispatch();
  const { summaryPeriod } = useSelector(state => state.blip.tideDashboardFilters);

  const handleChange = (summaryPeriod) => {
    dispatch(setSummaryPeriodFilter(summaryPeriod));
    dispatch(setOffset(0));
  };

  return (
    <SummaryPeriodFilterDropdown
      onChange={handleChange}
      activeSummaryPeriod={summaryPeriod}
    />
  );
};

export default FilterBySummaryPeriod;
