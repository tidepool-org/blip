import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as actions from '../../redux/actions';
import get from 'lodash/get';
import includes from 'lodash/includes';
import noop from 'lodash/noop';

import TagFilterDropdown from './components/TagFilterDropdown';
import useIsClinicAdmin from './useIsClinicAdmin';

const trackMetric = noop; // TODO: FIX

const FilterByTags = ({
  api,
  activeFilters = {},
  setActiveFilters = noop,
  setShowClinicPatientTagsDialog = noop,
}) => {
  const dispatch = useDispatch();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const isClinicAdmin = useIsClinicAdmin();

  const handleChange = (patientTags) => {
    setActiveFilters({ ...activeFilters, patientTags });
  };

  const patientTags = activeFilters?.patientTags;

  const handleClickEditTags = () => {
    trackMetric('Clinic - Population Health - Edit clinic tags open', { clinicId: selectedClinicId, source: 'Filter menu' });
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
