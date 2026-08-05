import React from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';

import SummaryPeriodFilterDropdown from '../components/SummaryPeriodFilterDropdown';

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

FilterBySummaryPeriod.propTypes = {
  activeSummaryPeriod: PropTypes.oneOf(['1d', '7d', '14d', '30d']),
  setActiveSummaryPeriod: PropTypes.func,
};

export default FilterBySummaryPeriod;
