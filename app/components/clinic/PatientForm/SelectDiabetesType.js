import { noop } from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { selectElementStyleOverrides } from './SelectTags';
import { colors as vizColors } from '@tidepool/viz';
import { Label } from 'theme-ui';

import { DIABETES_TYPES } from '../../../core/constants';

const DIABETES_TYPE_OPTS = DIABETES_TYPES(); // eslint-disable-line new-cap

const SelectDiabetesType = ({
  onChange,
  value,
  selectMenuHeight = 240,
  onMenuOpen = noop,
}) => {
  const { t } = useTranslation();

  const selectOptions = [{ options: DIABETES_TYPE_OPTS }];

  const handleSelectDiabetesType = (opt) => onChange(opt?.value || null);

  const selectValue = DIABETES_TYPE_OPTS.find(type => type.value === value);

  return (
    <>
      <Label
        htmlFor='patient-form-select-diabetes-type'
        sx={{ fontSize: 1, fontWeight: 'medium', color: vizColors.blue50, lineHeight: 1.75 }}
      >
        {t('Diabetes Type (optional)')}
      </Label>
      <Select
        styles={selectElementStyleOverrides}
        name="patient-form-select-diabetes-type"
        id="patient-form-select-diabetes-type"
        classNamePrefix="PatientFormSelectDiabetesType"
        placeholder={t('Select Type')}
        value={selectValue}
        onChange={handleSelectDiabetesType}
        onMenuOpen={onMenuOpen}
        options={selectOptions}
        closeMenuOnSelect
        minMenuHeight={selectMenuHeight}
        maxMenuHeight={selectMenuHeight}
        isClearable
      />
    </>
  );
};

export default SelectDiabetesType;
