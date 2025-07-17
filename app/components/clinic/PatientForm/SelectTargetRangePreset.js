import { noop } from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { selectElementStyleOverrides } from './SelectTags';
import { colors as vizColors } from '@tidepool/viz';
import { Label } from 'theme-ui';

import CustomTargetRangeInput from './CustomTargetRangeInput';

// TODO: translate labels
// TODO: mmol/L version
const TARGET_RANGE_PRESET_OPTS = [
  { label: 'Standard (Type 1 and 2): 70-180 mg/dL', value: 'standard' },
  { label: 'Older/High Risk (Type 1 and 2): 70-180 mg/dL', value: 'high_risk' },
  { label: 'Pregnancy (Type 1): 63-140 mg/dL', value: 'pregnancy' },
  { label: 'Pregnancy (Gestational and Type 2): 63-140 mg/dL', value: 'gestational' },
  { label: 'Custom', value: 'custom' },
];

const SelectTargetRangePreset = ({ onChange, value }) => {
  const { t } = useTranslation();

  const selectOptions = [{ options: TARGET_RANGE_PRESET_OPTS }];

  const handleSelectRange = (opt) => {
    onChange(opt?.value || '');
  };

  const handleCustomRangeChange = (values) => {
    console.log(values);
  };

  const selectValue = TARGET_RANGE_PRESET_OPTS.find(opt => opt.value === value);

  const onMenuOpen = noop;

  return (
    <>
      <Label
        htmlFor='patient-form-select-target-range-preset'
        sx={{ fontSize: 1, fontWeight: 'medium', color: vizColors.blue50, lineHeight: 1.75 }}
      >
        {t('Target Range (optional)')}
      </Label>
      <Select
        styles={selectElementStyleOverrides}
        name="patient-form-select-target-range-preset"
        id="patient-form-select-target-range-preset"
        classNamePrefix="PatientFormSelectTargetRangePreset"
        // placeholder={''}
        value={selectValue}
        onChange={handleSelectRange}
        onMenuOpen={onMenuOpen}
        options={selectOptions}
        closeMenuOnSelect
        // minMenuHeight={selectMenuHeight}
        // maxMenuHeight={selectMenuHeight}
        // filterOption={createFilter({ stringify: opt => opt.label })}
        isClearable
      />
    </>
  );
};

export default SelectTargetRangePreset;
