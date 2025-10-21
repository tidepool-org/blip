import * as yup from 'yup';
import map from 'lodash/map';

import { utils as vizUtils } from '@tidepool/viz';
const { GLYCEMIC_RANGES_TYPE, GLYCEMIC_RANGES_PRESET } = vizUtils.constants;

import i18next from './language';
const t = i18next.t.bind(i18next);

export const glycemicRangesSchema = yup.object().shape({
  type: yup.string()
           .oneOf(map(GLYCEMIC_RANGES_TYPE))
           .required(t('Please select a target range option')),
  preset: yup.string().oneOf(map(GLYCEMIC_RANGES_PRESET)).required(),
  custom: yup.object().notRequired(),
});

export const getGlycemicRangesPreset = vizUtils.glycemicRanges.getGlycemicRangesPreset;

/**
 * Creates a glycemicRanges object to be stored in the clinicPatient record
 *
 * @param {String} glycemicRangesPreset target range preset, e.g. 'adaPregnancyType1', etc
 *
 * @return {Object} glycemicRanges object for the clinicPatient record
 */
export const buildGlycemicRangesFromPreset = glycemicRangesPreset => {
  if (!glycemicRangesPreset) return undefined;

  const isValid = map(GLYCEMIC_RANGES_PRESET).includes(glycemicRangesPreset);

  if (!isValid) return undefined;

  return {
    type: GLYCEMIC_RANGES_TYPE.PRESET,
    preset: glycemicRangesPreset,
  };
};

export const DEFAULT_GLYCEMIC_RANGES = buildGlycemicRangesFromPreset(GLYCEMIC_RANGES_PRESET.ADA_STANDARD);
