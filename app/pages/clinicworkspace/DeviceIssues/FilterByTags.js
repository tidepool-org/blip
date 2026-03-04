import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPatientTagsFilter } from './deviceIssuesFiltersSlice';
import TagFilterDropdown from '../components/TagFilterDropdown';

const FilterByTags = () => {
  const dispatch = useDispatch();
  const { patientTags } = useSelector(state => state.blip.deviceIssuesFilters);

  const handleChange = (tags) => dispatch(setPatientTagsFilter(tags));

  return <TagFilterDropdown onChange={handleChange} patientTags={patientTags} />;
};

export default FilterByTags;
