import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as actions from '../../../redux/actions';
import { trackMetric } from '../../../core/metricUtils';
import get from 'lodash/get';
import includes from 'lodash/includes';
import noop from 'lodash/noop';

import SiteFilterDropdown from '../components/SiteFilterDropdown';
import useIsClinicAdmin from '../useIsClinicAdmin';
import useClinicMetricsPageName from '../useClinicMetricsPageName';

const FilterBySites = ({
  api,
  activeFilters = {},
  setActiveFilters = noop,
  setShowClinicSitesDialog = noop,
}) => {
  const dispatch = useDispatch();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const isClinicAdmin = useIsClinicAdmin();
  const pageName = useClinicMetricsPageName();

  const handleChange = (clinicSites) => {
    setActiveFilters({ ...activeFilters, clinicSites });
  };

  const clinicSites = activeFilters?.clinicSites;

  const handleClickEditSites = () => {
    trackMetric('Clinic - Edit clinic sites open', { clinicId: selectedClinicId, source: 'Filter menu', pageName });
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
