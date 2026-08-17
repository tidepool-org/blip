import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setOffset } from './tideDashboardSlice';
import { setClinicSitesFilter } from './tideDashboardFiltersSlice';
import SiteFilterDropdown from '../components/SiteFilterDropdown';

const FilterBySites = () => {
  const dispatch = useDispatch();
  const { clinicSites } = useSelector(state => state.blip.tideDashboardFilters);

  const handleChange = (clinicSites) => {
    dispatch(setClinicSitesFilter(clinicSites));
    dispatch(setOffset(0));
  };

  return <SiteFilterDropdown onChange={handleChange} clinicSites={clinicSites} />;
};

export default FilterBySites;
