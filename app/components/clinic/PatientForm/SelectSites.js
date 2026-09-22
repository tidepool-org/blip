import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import partition from 'lodash/partition';
import Select, { createFilter } from 'react-select';
import { useLocation } from 'react-router-dom';
import useClinicPatientsFilters from '../../../pages/clinicworkspace/useClinicPatientsFilters';
import { useTranslation } from 'react-i18next';
import { noop } from 'lodash';
import utils from '../../../core/utils';

import { selectElementStyleOverrides } from './styles';
import CappedValueContainer from './CappedValueContainer';

export const buildSelectOptions = (
  t,
  clinicSites = [],
  activeFilters = { clinicSites: [] },
  shouldSuggestSites = false,
) => {
  // Format sites for react-select (label and value properties), then sort
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
  options, // Optional array of sites to choose from, e.g. [{ id: 'id1', name: 'Site1' }]
  maxVisibleValues,
  menuPlacement,
  selectMenuHeight = 240,
  onMenuOpen = noop,
  isDisabled = false,
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

  // Suggestions come from the clinic patient list's own filters, which is the only filter store
  // this reads, so they are offered on that route alone. A caller supplying its own options is not
  // choosing from that catalogue at all.
  const shouldSuggestSites = !options && pathname?.includes('/clinic-workspace');

  const selectOptions = buildSelectOptions(t, options || clinic?.sites, activeFilters, shouldSuggestSites);

  const selectValue = currentSites.map(site => ({
    label: site.name || '',
    value: site.id,
  }));

  return (
    <Select
      styles={selectElementStyleOverrides}
      components={{ ValueContainer: CappedValueContainer }}
      maxVisibleValues={maxVisibleValues}
      menuPlacement={menuPlacement}
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
      isDisabled={isDisabled}
    />
  );
};

SelectSites.propTypes = {
  currentSites: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
    })
  ).isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  })),
  maxVisibleValues: PropTypes.number,
  menuPlacement: PropTypes.oneOf(['auto', 'bottom', 'top']),
  selectMenuHeight: PropTypes.number,
  onMenuOpen: PropTypes.func,
  isDisabled: PropTypes.bool,
};

SelectSites.defaultProps = {
  selectMenuHeight: 240,
  onMenuOpen: noop,
};

export default SelectSites;
