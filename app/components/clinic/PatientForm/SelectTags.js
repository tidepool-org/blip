import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import keyBy from 'lodash/keyBy';
import partition from 'lodash/partition';
import Select from 'react-select';
import { Box } from 'theme-ui';
import { useLocation } from 'react-router-dom';
import { colors } from '../../../themes/baseTheme';
import useClinicPatientsFilters from '../../../pages/clinicworkspace/useClinicPatientsFilters';
import { useTranslation } from 'react-i18next';

export const getSelectOptions = (
  t,
  clinicTags = [],
  activeFilters = { patientTags: [] },
  shouldSuggestTags = false,
) => {
  // Format tags for React-Select (label and value properties)
  const allOptions = clinicTags.map(tag => ({ label: tag.name, value: tag.id }));

  // If we shouldn't be suggesting, return a single group of all options
  if (!shouldSuggestTags) {
    return [{ label: '', options: allOptions, hideTopBorder: true }];
  };

  // Otherwise, partition into suggested and non-suggested groups, then return the two groups
  const [suggested, nonSuggested] = partition(allOptions, option => {
    const currentFilterTagIds = activeFilters?.patientTags || [];
    return currentFilterTagIds.includes(option.value);
  });

  return [
    { label: t('Suggested - based on current dashboard filters'), options: suggested, hideTopBorder: true },
    { label: '', options: nonSuggested, hideTopBorder: suggested.length <= 0 },
  ];
};

export const selectElementStyleOverrides = {
  group: (baseStyles, state) => ({
    ...baseStyles,
    borderTop: state.headingProps?.data?.hideTopBorder ? 'none' : `1px solid ${colors.blueGray10}`,
    marginLeft: '12px',
    marginRight: '12px',
  }),
  groupHeading: (baseStyles) => ({
    ...baseStyles,
    textTransform: 'none',
    fontWeight: 'normal',
    paddingLeft: '0',
    paddingRight: '0',
  }),
  option: (baseStyles) => ({
    ...baseStyles,
    paddingLeft: '2px',
    paddingRight: '2px',
  }),
};

const SelectTags = ({ onChange, currentTagIds }) => {
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

  const selectOptions = getSelectOptions(t, clinic?.patientTags, activeFilters, shouldSuggestTags);

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
        options={selectOptions}
        closeMenuOnSelect={false}
        isMulti
        isClearable
      />
    </Box>
  );
};

export default SelectTags;
