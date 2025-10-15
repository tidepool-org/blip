import React from 'react';
import { noop } from 'lodash';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { selectElementStyleOverrides } from './styles';
import { colors as vizColors, utils as vizUtils } from '@tidepool/viz';
import { Label } from 'theme-ui';
import {
  getGlycemicRangesPreset,
  buildGlycemicRangesFromPreset,
} from '../../../core/glycemicRangesUtils';

import { MGDL_UNITS, MMOLL_UNITS } from '../../../core/constants';
const { GLYCEMIC_RANGES_PRESET } = vizUtils.constants;

const GLYCEMIC_RANGE_OPTS = {
  [MGDL_UNITS]: [
    { label: 'Standard (Type 1 and 2): 70-180 mg/dL', value: GLYCEMIC_RANGES_PRESET.ADA_STANDARD },
    { label: 'Older/High Risk (Type 1 and 2): 70-180 mg/dL', value: GLYCEMIC_RANGES_PRESET.ADA_OLDER_HIGH_RISK },
    { label: 'Pregnancy (Type 1): 63-140 mg/dL', value: GLYCEMIC_RANGES_PRESET.ADA_PREGNANCY_T1 },
    { label: 'Pregnancy (Gestational and Type 2): 63-140 mg/dL', value: GLYCEMIC_RANGES_PRESET.ADA_GESTATIONAL_T2 },
  ],
  [MMOLL_UNITS]: [
    { label: 'Standard (Type 1 and 2): 3.9-10.0 mmol/L', value: GLYCEMIC_RANGES_PRESET.ADA_STANDARD },
    { label: 'Older/High Risk (Type 1 and 2): 3.9-10.0 mmol/L', value: GLYCEMIC_RANGES_PRESET.ADA_OLDER_HIGH_RISK },
    { label: 'Pregnancy (Type 1): 3.5-7.8 mmol/L', value: GLYCEMIC_RANGES_PRESET.ADA_PREGNANCY_T1 },
    { label: 'Pregnancy (Gestational and Type 2): 3.5-7.8 mmol/L', value: GLYCEMIC_RANGES_PRESET.ADA_GESTATIONAL_T2 },
  ],
};

const SelectGlycemicRanges = ({
  onChange,
  value: glycemicRanges,
  selectMenuHeight = 240,
  onMenuOpen = noop,
}) => {
  const { t } = useTranslation();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);
  const clinicBgUnits = clinic?.preferredBgUnits || MGDL_UNITS;

  const glycemicRangesPreset = getGlycemicRangesPreset(glycemicRanges);

  const selectOptions = [{ options: GLYCEMIC_RANGE_OPTS[clinicBgUnits] }];

  const handleSelectRange = (opt) => {
    const updatedValue = buildGlycemicRangesFromPreset(opt?.value);
    onChange(updatedValue);
  };

  const selectValue = GLYCEMIC_RANGE_OPTS[clinicBgUnits].find(opt => opt.value === glycemicRangesPreset);

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
        inputId="patient-form-select-target-range-preset"
        classNamePrefix="PatientFormSelectGlycemicRanges"
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

export default SelectGlycemicRanges;
