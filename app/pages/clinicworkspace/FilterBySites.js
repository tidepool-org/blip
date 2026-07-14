import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as actions from '../../redux/actions';
import get from 'lodash/get';
import includes from 'lodash/includes';
import noop from 'lodash/noop';

import SiteFilterDropdown from './components/SiteFilterDropdown';
import useIsClinicAdmin from './useIsClinicAdmin';

const trackMetric = noop; // TODO: FIX

const FilterBySites = ({
  api,
  activeFilters = {},
  setActiveFilters = noop,
  setShowClinicSitesDialog = noop,
}) => {
  const dispatch = useDispatch();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const isClinicAdmin = useIsClinicAdmin();

  const handleChange = (clinicSites) => {
    setActiveFilters({ ...activeFilters, clinicSites });
  };

  const clinicSites = activeFilters?.clinicSites;

  const handleClickEditSites = () => {
    trackMetric('Clinic - Population Health - Edit clinic sites open', { clinicId: selectedClinicId, source: 'Filter menu' });
    dispatch(actions.async.fetchClinicSites(api, selectedClinicId)); // current data in clinic object may be stale
    setShowClinicSitesDialog(true);
  };

  return (
    <SiteFilterDropdown
      onChange={handleChange}
      onClickEditSites={isClinicAdmin ? handleClickEditSites : null}
      clinicSites={clinicSites}
    />
  );
};

export default FilterBySites;
