import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import without from 'lodash/without';
import noop from 'lodash/noop';

import ActiveFiltersTray from '../components/ActiveFiltersTray';
import ClearFilterButtons, { PATIENT_QUERY_STATE } from '../components/ClearFilterButtons';
import { Box } from 'theme-ui';
import { setClinicSitesFilter, setPatientTagsFilter } from './tideDashboardFiltersSlice';
import { setOffset } from './tideDashboardSlice';

export const getPatientQueryState = (patientTags, clinicSites) => {
  const hasFiltersActive = clinicSites?.length > 0 || patientTags?.length > 0;

  if (hasFiltersActive) return PATIENT_QUERY_STATE.FILTER_ONLY;

  return PATIENT_QUERY_STATE.NONE;
};

const AppliedFiltersList = ({ patientCount = 0 }) => {
  const dispatch = useDispatch();

  const { lastData, clinicSites, patientTags } = useSelector(state => state.blip.tideDashboardFilters);

  const activeFilters = {
    lastDataType: 'cgm',
    lastData,
    clinicSites,
    patientTags,
  };

  const handleResetFilters = () => {
    dispatch(setPatientTagsFilter([]));
    dispatch(setClinicSitesFilter([]));
    dispatch(setOffset(0));
  };

  const handleRemoveFilter = (filterKey, value) => {
    switch (filterKey) {
      case 'patientTags':
        const updatedTags = without(patientTags, value);
        dispatch(setPatientTagsFilter(updatedTags));
        dispatch(setOffset(0));
        break;

      case 'clinicSites':
        const updatedSites = without(clinicSites, value);
        dispatch(setClinicSitesFilter(updatedSites));
        dispatch(setOffset(0));
        break;
    }
  };

  const patientQueryState = getPatientQueryState(patientTags, clinicSites);

  return (
    <ActiveFiltersTray
      patientCount={patientCount}
      hasSearchActive={false} // No patient search in TIDE Dashboard
      filters={activeFilters}
      onRemoveFilter={handleRemoveFilter}
      rightContent={
        <Box sx={{ fontSize: 0 }}>
          <ClearFilterButtons
            patientQueryState={patientQueryState}
            onClearSearch={noop}
            onResetFilters={handleResetFilters}
          />
        </Box>
      }
    />
  );
};

AppliedFiltersList.propTypes = {
  patientCount: PropTypes.number,
};

export default AppliedFiltersList;
