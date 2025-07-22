import React from 'react';
import { noop } from 'lodash';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { selectElementStyleOverrides } from './SelectTags';
import { colors as vizColors } from '@tidepool/viz';
import { Label } from 'theme-ui';

import { MGDL_UNITS, MMOLL_UNITS } from '../../../core/constants';

// Todo: Align values with backend
export const TARGET_RANGE_PRESET = {
  STANDARD: 'STANDARD',
  HIGH_RISK: 'HIGH_RISK',
  PREGNANCY: 'PREGNANCY',
  GESTATIONAL: 'GESTATIONAL',
  // CUSTOM: 'CUSTOM',
};

const TARGET_RANGE_PRESET_OPTS = {
  [MGDL_UNITS]: [
    { label: 'Standard (Type 1 and 2): 70-180 mg/dL', value: TARGET_RANGE_PRESET.STANDARD },
    { label: 'Older/High Risk (Type 1 and 2): 70-180 mg/dL', value: TARGET_RANGE_PRESET.HIGH_RISK },
    { label: 'Pregnancy (Type 1): 63-140 mg/dL', value: TARGET_RANGE_PRESET.PREGNANCY },
    { label: 'Pregnancy (Gestational and Type 2): 63-140 mg/dL', value: TARGET_RANGE_PRESET.GESTATIONAL },
  ],
  [MMOLL_UNITS]: [
    { label: 'Standard (Type 1 and 2): 3.9-10.0 mmol/L', value: TARGET_RANGE_PRESET.STANDARD },
    { label: 'Older/High Risk (Type 1 and 2): 3.9-10.0 mmol/L', value: TARGET_RANGE_PRESET.HIGH_RISK },
    { label: 'Pregnancy (Type 1): 3.5-7.8 mmol/L', value: TARGET_RANGE_PRESET.PREGNANCY },
    { label: 'Pregnancy (Gestational and Type 2): 3.5-7.8 mmol/L', value: TARGET_RANGE_PRESET.GESTATIONAL },
  ],
};

const SelectTargetRangePreset = ({
  onChange,
  value,
  selectMenuHeight = 240,
  onMenuOpen = noop,
}) => {
  const { t } = useTranslation();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);
  const clinicBgUnits = clinic?.preferredBgUnits || MGDL_UNITS;

  const selectOptions = [{ options: TARGET_RANGE_PRESET_OPTS[clinicBgUnits] }];

  const handleSelectRange = (opt) => onChange(opt?.value || null);

  const selectValue = TARGET_RANGE_PRESET_OPTS[clinicBgUnits].find(opt => opt.value === value);

  return (
    <>
      <Label
        htmlFor='patient-form-select-target-range-preset'
        sx={{ fontSize: 1, fontWeight: 'medium', color: vizColors.blue50, lineHeight: 1.75 }}
      >
        {t('Target Range')}
      </Label>
      <Select
        styles={selectElementStyleOverrides}
        name="patient-form-select-target-range-preset"
        id="patient-form-select-target-range-preset"
        classNamePrefix="PatientFormSelectTargetRangePreset"
        value={selectValue}
        onChange={handleSelectRange}
        onMenuOpen={onMenuOpen}
        options={selectOptions}
        closeMenuOnSelect
        minMenuHeight={selectMenuHeight}
        maxMenuHeight={selectMenuHeight}
      />
    </>
  );
};

export default SelectTargetRangePreset;
