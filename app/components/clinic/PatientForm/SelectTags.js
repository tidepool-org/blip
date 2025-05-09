import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import keyBy from 'lodash/keyBy';
import partition from 'lodash/partition';
import difference from 'lodash/difference';
import orderBy from 'lodash/orderBy';
import Select from 'react-select';
import { Box } from 'theme-ui';
import { useLocation } from 'react-router-dom';
import { colors } from '../../../themes/baseTheme';
import useClinicPatientsFilters from '../../../pages/clinicworkspace/useClinicPatientsFilters';
import { useTranslation } from 'react-i18next';

const SELECT_MENU_HEIGHT = 240;

export const buildSelectOptions = (
  t,
  clinicTags = [],
  activeFilters = { patientTags: [] },
  currentTagIds = [],
  shouldSuggestTags = false,
) => {
  // Format tags for React-Select (label and value properties)
  const unorderedOptions = clinicTags.map(tag => ({ label: tag.name, value: tag.id }));
  const options = orderBy(unorderedOptions, 'label');

  // If we shouldn't be suggesting, return a single group of all options
  if (!shouldSuggestTags) return [{ options: options, label: '' }];

  // Otherwise, partition into suggested and non-suggested groups, then return the two groups.
  // The suggested tags are the tags currently applied as filters on the clinic patient dashboard.
  const [suggested, nonSuggested] = partition(options, option => {
    const currentFilterTagIds = activeFilters?.patientTags || [];
    return currentFilterTagIds.includes(option.value);
  });

  const hasSuggestionsToRender = difference(suggested.map(t => t.value), currentTagIds).length > 0;

  return [
    { options: suggested, label: t('Suggested - based on current dashboard filters') },
    { options: nonSuggested, label: '', hasDivider: hasSuggestionsToRender },
  ];
};

export const selectElementStyleOverrides = {
  control: (baseStyles) => ({
    ...baseStyles,
    borderRadius: '3px',
    border: '1px solid #DFE2E6',
  }),
  placeholder: (baseStyles) => ({
    ...baseStyles,
    fontSize: 14,
    color: colors.blueGreyMedium,
  }),
  group: (baseStyles, state) => ({
    ...baseStyles,
    borderTop: state.headingProps?.data?.hasDivider ? `1px solid ${colors.blueGray10}` : 'none',
    marginLeft: '12px',
    marginRight: '12px',
  }),
  groupHeading: (baseStyles) => ({
    ...baseStyles,
    textTransform: 'none',
    fontWeight: 'normal',
    paddingLeft: '4px',
    paddingRight: '0',
  }),
  option: (baseStyles) => ({
    ...baseStyles,
    paddingLeft: '4px',
    paddingRight: '4px',
    fontSize: 14,
    color: colors.blueGreyDark,
  }),
};

const SelectTags = ({
  currentTagIds,
  onChange,
  onMenuOpen,
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

  // Suggest tags only if clinic has tags feature and current page is the Clinic Patient list (where
  // the Active Filters show up).
  const shouldSuggestTags = clinic?.entitlements?.patientTags && pathname === '/clinic-workspace';

  const selectOptions = buildSelectOptions(t, clinic?.patientTags, activeFilters, currentTagIds, shouldSuggestTags);

  // Format the currentTagIds for React-Select
  const selectValue = currentTagIds.map(tagId => ({
    label: clinicPatientTags[tagId]?.name || '',
    value: tagId,
  }));

  return (
    <Box className='input-group form-group clearfix'>
      <Select
        className='input-group-control form-control Select'
        classNamePrefix="Select"
        styles={selectElementStyleOverrides}
        name="add-patient-select-tags"
        id="add-patient-select-tags"
        placeholder={t('Add a Tag')}
        value={selectValue}
        onChange={handleTagSelectionChange}
        onMenuOpen={onMenuOpen}
        options={selectOptions}
        closeMenuOnSelect={false}
        minMenuHeight={SELECT_MENU_HEIGHT}
        maxMenuHeight={SELECT_MENU_HEIGHT}
        isMulti
        isClearable
      />
    </Box>
  );
};

export default SelectTags;
