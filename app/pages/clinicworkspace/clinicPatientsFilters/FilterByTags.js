import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as actions from '../../../redux/actions';
import { trackMetric } from '../../../core/metricUtils';
import get from 'lodash/get';
import includes from 'lodash/includes';
import noop from 'lodash/noop';

import TagFilterDropdown from '../components/TagFilterDropdown';
import useIsClinicAdmin from '../useIsClinicAdmin';
import { useClinicMetricsPageName } from '../../../core/metricUtils';

const FilterByTags = ({
  api,
  activeFilters = {},
  setActiveFilters = noop,
  setShowClinicPatientTagsDialog = noop,
}) => {
  const dispatch = useDispatch();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const isClinicAdmin = useIsClinicAdmin();
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

export default FilterByTags;
