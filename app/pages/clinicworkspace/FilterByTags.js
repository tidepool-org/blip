import React from 'react';
import noop from 'lodash/noop';

import TagFilterDropdown from './components/TagFilterDropdown';

const FilterByTags = ({ activeFilters = {}, setActiveFilters = noop }) => {
  const handleChange = (patientTags) => {
    setActiveFilters({ ...activeFilters, patientTags });
  };

  const patientTags = activeFilters?.patientTags;

  return <TagFilterDropdown onChange={handleChange} patientTags={patientTags} />;
};

export default FilterByTags;
