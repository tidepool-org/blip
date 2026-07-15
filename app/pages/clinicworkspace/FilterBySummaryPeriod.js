import React from 'react';
import noop from 'lodash/noop';

import SummaryPeriodFilterDropdown from './components/SummaryPeriodFilterDropdown';

const FilterBySummaryPeriod = ({
  activeSummaryPeriod,
  setActiveSummaryPeriod = noop,
}) => {
  const handleChange = (summaryPeriod) => {
    setActiveSummaryPeriod(summaryPeriod);
  };

  return (
    <SummaryPeriodFilterDropdown
      onChange={handleChange}
      activeSummaryPeriod={activeSummaryPeriod}
    />
  );
};

export default FilterBySummaryPeriod;
