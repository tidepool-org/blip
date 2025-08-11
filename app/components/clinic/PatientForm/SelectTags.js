import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import keyBy from 'lodash/keyBy';
import partition from 'lodash/partition';
import Select, { createFilter } from 'react-select';
import { useLocation } from 'react-router-dom';
import useClinicPatientsFilters from '../../../pages/clinicworkspace/useClinicPatientsFilters';
import { useTranslation } from 'react-i18next';
import { noop } from 'lodash';
import utils from '../../../core/utils';
import { selectElementStyleOverrides } from './styles';

export const buildSelectOptions = (
  t,
  clinicTags = [],
  activeFilters = { patientTags: [] },
  shouldSuggestTags = false,
) => {
  // Format tags for react-select (label and value properties), then sort
  const options = clinicTags.map(tag => ({ label: tag.name, value: tag.id }))
                            .toSorted((a, b) => utils.compareLabels(a.label, b.label));

  // If suggesting is disabled, return a single group of all options
  if (!shouldSuggestTags) return [{ options: options, label: '' }];

  // Otherwise, partition into suggested and non-suggested groups. The tags to suggest are
  // tags currently applied as filters on the clinic patient dashboard.
  const [suggested, nonSuggested] = partition(options, opt => activeFilters?.patientTags?.includes(opt.value));

  return [
    { options: suggested, label: t('Suggested - based on current dashboard filters') },
    { options: nonSuggested, label: '' },
  ];
};

const SelectTags = ({
  currentTagIds, // Array of tag IDs, e.g. ['id1', 'id2', 'id3']
  onChange,
  selectMenuHeight = 240,
  onMenuOpen = noop,
}) => {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);
  const clinicPatientTags = useMemo(() => keyBy(clinic?.patientTags, 'id'), [clinic?.patientTags]);
  const [activeFilters] = useClinicPatientsFilters();

  const handleTagSelectionChange = (tags) => {
    const tagIds = tags.map(tag => tag.value);
    // Call onChange with array of tag IDs, e.g. ['id1', 'id2', 'id3']
    onChange(tagIds);
  };

  // Suggest tags only if user is viewing ClinicPatients list (where Filters are used)
  const shouldSuggestTags = pathname === '/clinic-workspace';

  const selectOptions = buildSelectOptions(t, clinic?.patientTags, activeFilters, shouldSuggestTags);

  const selectValue = currentTagIds.map(tagId => ({
    label: clinicPatientTags[tagId]?.name || '',
    value: tagId,
  }));

  return (
    <Select
      styles={selectElementStyleOverrides}
      name="patient-form-select-tags"
      id="patient-form-select-tags"
      classNamePrefix="PatientFormSelectTags"
      placeholder={t('Add a Tag')}
      value={selectValue}
      onChange={handleTagSelectionChange}
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

SelectTags.propTypes = {
  currentTagIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  selectMenuHeight: PropTypes.number,
  onMenuOpen: PropTypes.func,
};

SelectTags.defaultProps = {
  selectMenuHeight: 240,
  onMenuOpen: noop,
};

export default SelectTags;
