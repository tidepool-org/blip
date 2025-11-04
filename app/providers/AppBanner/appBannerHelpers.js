import { utils as vizUtils } from '@tidepool/viz';
const { GLYCEMIC_RANGES_PRESET } = vizUtils.constants;

export const getDismissedAltRangeBannerKey = clinicId => `dismissedClinicAltRangeBannerTime-${clinicId}`;

export const getDismissedAltRangeNotificationKey = clinicId => `dismissedClinicAltRangeNotificationTime-${clinicId}`;

export const isRangeWithNonStandardTarget = (glycemicRangesPreset) => (
  glycemicRangesPreset === GLYCEMIC_RANGES_PRESET.ADA_PREGNANCY_T1 ||
  glycemicRangesPreset === GLYCEMIC_RANGES_PRESET.ADA_GESTATIONAL_T2
);
