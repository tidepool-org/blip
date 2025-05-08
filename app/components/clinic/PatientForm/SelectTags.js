import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import keyBy from 'lodash/keyBy';
import Select from 'react-select';
import { Box } from 'theme-ui';

const SelectTags = ({ onChange, currentTagIds }) => {
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);
  const clinicPatientTags = useMemo(() => keyBy(clinic?.patientTags, 'id'), [clinic?.patientTags]);

  const handleSelect = (tags) => {
    const tagIds = tags.map(tag => tag.value);
    onChange(tagIds);
  };

  const selectValue = currentTagIds.map(tagId => ({
    label: clinicPatientTags[tagId]?.name || '',
    value: tagId,
  }));

  const selectOptions = clinic?.patientTags?.map(tag => ({
    label: tag.name,
    value: tag.id,
  })) || [];

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
