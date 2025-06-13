import React from 'react';
import { useSelector } from 'react-redux';
import partition from 'lodash/partition';
import Select, { createFilter } from 'react-select';
import { useLocation } from 'react-router-dom';
import useClinicPatientsFilters from '../../../pages/clinicworkspace/useClinicPatientsFilters';
import { useTranslation } from 'react-i18next';
import { noop } from 'lodash';
import utils from '../../../core/utils';

import { selectElementStyleOverrides } from './SelectTags';

export const buildSelectOptions = (
  t,
  clinicSites = [],
  activeFilters = { clinicSites: [] },
  shouldSuggestSites = false,
) => {
  // Format tags for react-select (label and value properties), then sort
  const options = clinicSites.map(site => ({ label: site.name, value: site.id }))
                             .toSorted((a, b) => utils.compareLabels(a.label, b.label));

  // If suggesting is disabled, return a single group of all options
  if (!shouldSuggestSites) return [{ options: options, label: '' }];

  // Otherwise, partition into suggested and non-suggested groups. The sites to suggest are
  // sites currently applied as filters on the clinic patient dashboard.
  const [suggested, nonSuggested] = partition(options, opt => activeFilters?.clinicSites?.includes(opt.value));

  return [
    { options: suggested, label: t('Suggested - based on current dashboard filters') },
    { options: nonSuggested, label: '' },
  ];
};

const SelectSites = ({
  currentSites = [], // Array of sites, e.g. [{ id: 'id1', name: 'Site1' }]
  onChange,
  selectMenuHeight = 240,
  onMenuOpen = noop,
}) => {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);
  const [activeFilters] = useClinicPatientsFilters();

  const handleSiteSelectionChange = (sites) => {
    const formattedSites = sites.map(site => ({ name: site.label, id: site.value }));
    // Call onChange with array of sites, e.g. [{ id: 'id1', name: 'Site1' }]
    onChange(formattedSites);
  };

  // Suggest tags only if user is viewing ClinicPatients list (where Filters are used)
  const shouldSuggestSites = pathname === '/clinic-workspace';

  const selectOptions = buildSelectOptions(t, clinic?.sites, activeFilters, shouldSuggestSites);

  const selectValue = currentSites.map(site => ({
    label: site.name || '',
    value: site.id,
  }));

  return (
    <Select
      styles={selectElementStyleOverrides}
      name="patient-form-select-sites"
      id="patient-form-select-sites"
      classNamePrefix="PatientFormSelectSites"
      placeholder={t('Add a Site')}
      value={selectValue}
      onChange={handleSiteSelectionChange}
      onMenuOpen={onMenuOpen}
      options={selectOptions}
      closeMenuOnSelect={false}
      minMenuHeight={selectMenuHeight}
      maxMenuHeight={selectMenuHeight}
      filterOption={createFilter({ stringify: opt => opt.label })}
      isMulti
      isClearable
    />
  );
};

export default SelectSites;
