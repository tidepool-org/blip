import * as yup from 'yup';
import map from 'lodash/map';
import { utils as vizUtils } from '@tidepool/viz';
const { GLYCEMIC_RANGES_TYPE, GLYCEMIC_RANGES_PRESET } = vizUtils.constants;

export const glycemicRangesSchema = yup.object().shape({
  type: yup.string().oneOf(map(GLYCEMIC_RANGES_TYPE)),
  preset: yup.string().oneOf(map(GLYCEMIC_RANGES_PRESET)),
});

export const getGlycemicRangesPreset = glycemicRanges => {
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
  if (!glycemicRangesPreset) return null;

  return {
    type: GLYCEMIC_RANGES_TYPE.PRESET,
    preset: glycemicRangesPreset,
  };
};
