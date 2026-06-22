import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import keyBy from 'lodash/keyBy';
import isEqual from 'lodash/isEqual';
import without from 'lodash/without';

import { setOffset } from './deviceIssuesSlice';
import {
  resetDeviceIssuesFilters,
  setPatientTagsFilter,
  setClinicSitesFilter,
} from './deviceIssuesFiltersSlice';
import { SPECIAL_FILTER_STATES } from '../ClinicPatients';
import FilterDisplayBar, { FILTER_TYPE } from '../components/FilterDisplayBar';

const FilterDisplay = ({ count = 0 }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);
  const { patientTags, clinicSites } = useSelector(state => state.blip.deviceIssuesFilters);

  const tagsById = keyBy(clinic?.patientTags, 'id');
  const sitesById = keyBy(clinic?.sites, 'id');

  const isFilteringForZeroTags = isEqual(patientTags, SPECIAL_FILTER_STATES.ZERO_TAGS);
  const isFilteringForZeroSites = isEqual(clinicSites, SPECIAL_FILTER_STATES.ZERO_SITES);

  const tagFilters = isFilteringForZeroTags
    ? [{ id: SPECIAL_FILTER_STATES.ZERO_TAGS[0], name: t('No Tags') }]
    : (patientTags || []).map(id => tagsById[id]).filter(Boolean);

  const siteFilters = isFilteringForZeroSites
    ? [{ id: SPECIAL_FILTER_STATES.ZERO_SITES[0], name: t('No Sites') }]
    : (clinicSites || []).map(id => sitesById[id]).filter(Boolean);

  const handleRemove = (type, { id }) => {
    if (type === FILTER_TYPE.TAG) dispatch(setPatientTagsFilter(without(patientTags, id)));
    if (type === FILTER_TYPE.SITE) dispatch(setClinicSitesFilter(without(clinicSites, id)));
    dispatch(setOffset(0));
  };

  const handleReset = () => {
    dispatch(resetDeviceIssuesFilters());
    dispatch(setOffset(0));
  };

  return (
    <FilterDisplayBar
      count={count}
      tags={tagFilters}
      sites={siteFilters}
      onRemove={handleRemove}
      onReset={handleReset}
    />
  );
};

export default FilterDisplay;
