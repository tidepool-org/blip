import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPatientTagsFilter } from './tideDashboardFiltersSlice';
import TagFilterDropdown from '../components/TagFilterDropdown';

const FilterByTags = () => {
  const dispatch = useDispatch();
  const { patientTags } = useSelector(state => state.blip.tideDashboardFilters);

  const handleChange = (tags) => dispatch(setPatientTagsFilter(tags));

  return <TagFilterDropdown onChange={handleChange} patientTags={patientTags} />;
};

export default FilterByTags;
