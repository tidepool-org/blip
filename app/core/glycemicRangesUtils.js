import * as yup from 'yup';
import map from 'lodash/map';
import { utils as vizUtils } from '@tidepool/viz';
const { GLYCEMIC_RANGES_TYPE, GLYCEMIC_RANGES_PRESET } = vizUtils.constants;

import i18next from './language';
const t = i18next.t.bind(i18next);

export const glycemicRangesSchema = yup.object().shape({
  type: yup.string().oneOf(map(GLYCEMIC_RANGES_TYPE)).required(),
  preset: yup.string().oneOf(map(GLYCEMIC_RANGES_PRESET)).required(),
  custom: yup.object().notRequired(),
});

export const getGlycemicRangesPreset = glycemicRanges => {
  // glycemicRanges field will not exist on older clinicPatient records
  if (!glycemicRanges) return GLYCEMIC_RANGES_PRESET.ADA_STANDARD;

  switch (glycemicRanges.type) {
    case GLYCEMIC_RANGES_TYPE.PRESET:
      return glycemicRanges.preset;
    case GLYCEMIC_RANGES_TYPE.CUSTOM:
      // feature to be implemented in future revisions
    default:
      return GLYCEMIC_RANGES_PRESET.ADA_STANDARD;
  }
};

export const buildGlycemicRangesFromPreset = glycemicRangesPreset => {
  if (!glycemicRangesPreset) return undefined;

  return {
    type: GLYCEMIC_RANGES_TYPE.PRESET,
    preset: glycemicRangesPreset,
  };
};
