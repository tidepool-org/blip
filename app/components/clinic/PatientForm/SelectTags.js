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
import CappedValueContainer from './CappedValueContainer';

export const buildSelectOptions = (
  t,
  clinicTags = [],
  activeFilters = { patientTags: [] },
  shouldSuggestTags = false,
) => {
  // Format tags for react-select (label and value properties), then sort
  const options = utils.sortByLabel(clinicTags.map(tag => ({ label: tag.name, value: tag.id })), 'label');

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
  options, // Optional array of tags to choose from, e.g. [{ id: 'id1', name: 'Tag1' }]
  maxVisibleValues,
  menuPlacement,
  selectMenuHeight = 240,
  onMenuOpen = noop,
  closeMenuOnSelect = false,
  isDisabled = false,
}) => {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);
  const availableTags = options || clinic?.patientTags;
  const clinicPatientTags = useMemo(() => keyBy(availableTags, 'id'), [availableTags]);
  const [activeFilters] = useClinicPatientsFilters();

  const handleTagSelectionChange = (tags) => {
    const tagIds = tags.map(tag => tag.value);
    // Call onChange with array of tag IDs, e.g. ['id1', 'id2', 'id3']
    onChange(tagIds);
  };

  // Suggestions come from the clinic patient list's own filters, which is the only filter store
  // this reads, so they are offered on that route alone. A caller supplying its own options is not
  // choosing from that catalogue at all.
  const shouldSuggestTags = !options && pathname?.includes('/clinic-workspace');

  const selectOptions = buildSelectOptions(t, availableTags, activeFilters, shouldSuggestTags);

  const selectValue = currentTagIds.map(tagId => ({
    label: clinicPatientTags[tagId]?.name || '',
    value: tagId,
  }));

  return (
    <Select
      styles={selectElementStyleOverrides}
      components={{ ValueContainer: CappedValueContainer }}
      maxVisibleValues={maxVisibleValues}
      menuPlacement={menuPlacement}
      name="patient-form-select-tags"
      id="patient-form-select-tags"
      classNamePrefix="PatientFormSelectTags"
      placeholder={t('Add a Tag')}
      value={selectValue}
      onChange={handleTagSelectionChange}
      onMenuOpen={onMenuOpen}
      options={selectOptions}
      closeMenuOnSelect={closeMenuOnSelect}
      minMenuHeight={selectMenuHeight}
      maxMenuHeight={selectMenuHeight}
      filterOption={createFilter({ stringify: opt => opt.label })}
      isMulti
      isClearable
      isDisabled={isDisabled}
    />
  );
};

SelectTags.propTypes = {
  currentTagIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  })),
  maxVisibleValues: PropTypes.number,
  menuPlacement: PropTypes.oneOf(['auto', 'bottom', 'top']),
  selectMenuHeight: PropTypes.number,
  onMenuOpen: PropTypes.func,
  closeMenuOnSelect: PropTypes.bool,
  isDisabled: PropTypes.bool,
};

SelectTags.defaultProps = {
  selectMenuHeight: 240,
  onMenuOpen: noop,
};

export default SelectTags;
