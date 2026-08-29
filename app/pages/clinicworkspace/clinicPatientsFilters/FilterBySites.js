import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import * as actions from '../../../redux/actions';
import { trackMetric } from '../../../core/metricUtils';
import noop from 'lodash/noop';

import SiteFilterDropdown from '../components/filters/SiteFilterDropdown';
import useClinicMetricsPageName from '../useClinicMetricsPageName';
import useClinic from '../useClinic';

const FilterBySites = ({
  api,
  activeFilters = {},
  setActiveFilters = noop,
  setShowClinicSitesDialog = noop,
}) => {
  const dispatch = useDispatch();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const { isClinicAdmin } = useClinic();
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

FilterBySites.propTypes = {
  api: PropTypes.object.isRequired,
  activeFilters: PropTypes.shape({
    clinicSites: PropTypes.arrayOf(PropTypes.string),
  }),
  setActiveFilters: PropTypes.func,
  setShowClinicSitesDialog: PropTypes.func,
};

export default FilterBySites;
