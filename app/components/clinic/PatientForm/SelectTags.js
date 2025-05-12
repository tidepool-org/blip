import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import keyBy from 'lodash/keyBy';
import partition from 'lodash/partition';
import orderBy from 'lodash/orderBy';
import Select, { createFilter } from 'react-select';
import { Box } from 'theme-ui';
import { useLocation } from 'react-router-dom';
import { colors } from '../../../themes/baseTheme';
import useClinicPatientsFilters from '../../../pages/clinicworkspace/useClinicPatientsFilters';
import { useTranslation } from 'react-i18next';
import { noop } from 'lodash';

export const buildSelectOptions = (
  t,
  clinicTags = [],
  activeFilters = { patientTags: [] },
  shouldSuggestTags = false,
) => {
  // Format tags for react-select (label and value properties), then sort alphabetically
  const unorderedOptions = clinicTags.map(tag => ({ label: tag.name, value: tag.id }));
  const options = orderBy(unorderedOptions, 'label');

  // If suggesting is disabled, return a single group of all options
  if (!shouldSuggestTags) return [{ options: options, label: '' }];

  // Otherwise, partition into suggested and non-suggested groups, then return the two groups.
  // The suggested tags are the tags currently applied as filters on the clinic patient dashboard.
  const [suggested, nonSuggested] = partition(options, option => {
    const currentFilterTagIds = activeFilters?.patientTags || [];
    return currentFilterTagIds.includes(option.value);
  });

  return [
    { options: suggested, label: t('Suggested - based on current dashboard filters') },
    { options: nonSuggested, label: '' },
  ];
};

export const selectElementStyleOverrides = {
  option: base => ({ ...base, paddingLeft: '4px', paddingRight: '4px', fontSize: 14, color: colors.blueGreyDark }),
  control: base => ({ ...base, borderRadius: '3px', border: '1px solid #DFE2E6' }),
  placeholder: base => ({ ...base, fontSize: 14, color: colors.blueGreyMedium }),
  groupHeading: base => ({ ...base, textTransform: 'none', fontWeight: 'normal', paddingLeft: '4px', paddingRight: '0' }),
  multiValue: base => ({ ...base, borderRadius: '3px', background: colors.blueGreyDark, border: 'none' }),
  multiValueLabel: base => ({ ...base, borderRadius: '0', color: colors.white }),
  group: base => ({
    ...base,
    marginLeft: '12px',
    marginRight: '12px',
    '&:nth-of-type(2)': {
      borderTop: `1px solid ${colors.blueGray10}`,
    },
  }),
  multiValueRemove: base => ({
    ...base,
    borderRadius: '3px',
    color: colors.white,
    '&:hover': {
      background: 'none',
      cursor: 'pointer',
      color: colors.white,
    },
  }),
};

const SelectTags = ({
  currentTagIds,
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
    onChange(tagIds);
  };

  // Suggest tags only if clinic has tags feature and user is viewing ClinicPatients list (where Filters are used)
  const shouldSuggestTags = clinic?.entitlements?.patientTags && pathname === '/clinic-workspace';

  const selectOptions = buildSelectOptions(t, clinic?.patientTags, activeFilters, shouldSuggestTags);

  const selectValue = currentTagIds.map(tagId => ({
    label: clinicPatientTags[tagId]?.name || '',
    value: tagId,
  }));

  return (
    <Box className='input-group form-group clearfix'>
      <Select
        className='input-group-control form-control Select'
        classNamePrefix="SelectTags"
        styles={selectElementStyleOverrides}
        name="patient-form-select-tags"
        id="patient-form-select-tags"
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
    </Box>
  );
};

export default SelectTags;
