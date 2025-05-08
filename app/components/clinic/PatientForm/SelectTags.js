import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import keyBy from 'lodash/keyBy';
import partition from 'lodash/partition';
import Select from 'react-select';
import { Box } from 'theme-ui';
import { useLocation } from 'react-router-dom';
import useClinicPatientsFilters from '../../../pages/clinicworkspace/useClinicPatientsFilters';

export const getSelectOptions = (
  clinicTags = [],
  activeFilters,
  shouldSuggestTags = false,
) => {
  const allOptions = clinicTags.map(tag => ({ label: tag.name, value: tag.id }));

  if (!shouldSuggestTags) return allOptions;

  const [suggested, nonSuggested] = partition(allOptions, option => {
    const currentFilterTagIds = activeFilters?.patientTags || [];
    return currentFilterTagIds.includes(option.value);
  });

  const groupedOptions = [
    { label: 'Suggested', options: suggested },
    { label: '', options: nonSuggested },
  ];

  return groupedOptions;
};

const SelectTags = ({ onChange, currentTagIds }) => {
  const { pathname } = useLocation();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);
  const clinicPatientTags = useMemo(() => keyBy(clinic?.patientTags, 'id'), [clinic?.patientTags]);
  const [activeFilters] = useClinicPatientsFilters();

  const handleSelect = (tags) => {
    const tagIds = tags.map(tag => tag.value);
    onChange(tagIds);
  };

  // If clinic has tags feature and the current page is the patient list, suggest tags
  const shouldSuggestTags = clinic?.entitlements?.patientTags && pathname === '/clinic-workspace';

  const selectOptions = getSelectOptions(clinic?.patientTags, activeFilters, shouldSuggestTags);
  const selectValue = currentTagIds.map(tagId => ({
    label: clinicPatientTags[tagId]?.name || '',
    value: tagId,
  }));

  return (
    <Box className='input-group form-group clearfix'>
      <Select
        className='input-group-control form-control Select'
        classNamePrefix="Select"
        name="add-patient-select-tags"
        id="add-patient-select-tags"
        placeholder={'blah'}
        value={selectValue}
        onChange={handleSelect}
        options={selectOptions}
        closeMenuOnSelect={false}
        isMulti
        isClearable
      />
    </Box>
  );
};

export default SelectTags;
