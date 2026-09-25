import React from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';

import SummaryPeriodFilterDropdown from '../components/SummaryPeriodFilterDropdown';
import { summaryPeriodOptions } from '../../../core/clinicUtils';

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
  activeSummaryPeriod: PropTypes.oneOf(summaryPeriodOptions.map(opt => opt.value)).isRequired,
  setActiveSummaryPeriod: PropTypes.func,
};

export default FilterBySummaryPeriod;
