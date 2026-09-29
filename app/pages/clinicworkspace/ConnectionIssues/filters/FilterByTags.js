import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setOffset } from '../connectionIssuesSlice';
import { setPatientTagsFilter } from '../connectionIssuesFiltersSlice';
import TagFilterDropdown from '../../components/filters/TagFilterDropdown';

const FilterByTags = () => {
  const dispatch = useDispatch();
  const { patientTags } = useSelector(state => state.blip.connectionIssuesFilters);

  const handleChange = (tags) => {
    dispatch(setPatientTagsFilter(tags));
    dispatch(setOffset(0));
  };

  return <TagFilterDropdown onChange={handleChange} patientTags={patientTags} />;
};

export default FilterByTags;
