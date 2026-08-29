import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import * as actions from '../../../redux/actions';
import { trackMetric } from '../../../core/metricUtils';
import noop from 'lodash/noop';

import TagFilterDropdown from '../components/TagFilterDropdown';
import useClinicMetricsPageName from '../useClinicMetricsPageName';
import useClinic from '../useClinic';

const FilterByTags = ({
  api,
  activeFilters = {},
  setActiveFilters = noop,
  setShowClinicPatientTagsDialog = noop,
}) => {
  const dispatch = useDispatch();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const { isClinicAdmin } = useClinic();
  const pageName = useClinicMetricsPageName();

  const handleChange = (patientTags) => {
    setActiveFilters({ ...activeFilters, patientTags });
  };

  const patientTags = activeFilters?.patientTags;

  const handleClickEditTags = () => {
    trackMetric('Clinic - Edit clinic tags open', { clinicId: selectedClinicId, source: 'Filter menu', pageName });
    dispatch(actions.async.fetchClinicPatientTags(api, selectedClinicId)); // current data in clinic object may be stale
    setShowClinicPatientTagsDialog(true);
  };

  return (
    <TagFilterDropdown
      onChange={handleChange}
      onClickEditTags={isClinicAdmin ? handleClickEditTags : null}
      patientTags={patientTags}
    />
  );
};

FilterByTags.propTypes = {
  api: PropTypes.object.isRequired,
  activeFilters: PropTypes.shape({
    patientTags: PropTypes.arrayOf(PropTypes.string),
  }),
  setActiveFilters: PropTypes.func,
  setShowClinicPatientTagsDialog: PropTypes.func,
};

export default FilterByTags;
