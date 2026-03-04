import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPatientTagsFilter } from './tideDashboardFiltersSlice';
import FilterByTags from '../components/FilterByTags';

const FilterByTagsController = () => {
  const dispatch = useDispatch();
  const { patientTags } = useSelector(state => state.blip.tideDashboardFilters);

  const handleChange = (tags) => dispatch(setPatientTagsFilter(tags));

  return <FilterByTags onChange={handleChange} patientTags={patientTags} />;
};

export default FilterByTagsController;
