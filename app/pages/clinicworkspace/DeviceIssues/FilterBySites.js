import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setOffset } from './deviceIssuesSlice';
import { setClinicSitesFilter } from './deviceIssuesFiltersSlice';
import SitesFilterDropdown from '../components/SitesFilterDropdown';

const FilterBySites = () => {
  const dispatch = useDispatch();
  const { clinicSites } = useSelector(state => state.blip.deviceIssuesFilters);

  const handleChange = (clinicSites) => {
    dispatch(setClinicSitesFilter(clinicSites));
    dispatch(setOffset(0));
  };

  return <SitesFilterDropdown onChange={handleChange} clinicSites={clinicSites} />;
};

export default FilterBySites;
