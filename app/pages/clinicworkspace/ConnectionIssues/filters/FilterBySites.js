import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setOffset } from '../connectionIssuesSlice';
import { setClinicSitesFilter } from '../connectionIssuesFiltersSlice';
import SiteFilterDropdown from '../../components/filters/SiteFilterDropdown';

const FilterBySites = () => {
  const dispatch = useDispatch();
  const { clinicSites } = useSelector(state => state.blip.connectionIssuesFilters);

  const handleChange = (clinicSites) => {
    dispatch(setClinicSitesFilter(clinicSites));
    dispatch(setOffset(0));
  };

  return <SiteFilterDropdown onChange={handleChange} clinicSites={clinicSites} />;
};

export default FilterBySites;
