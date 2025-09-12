import { utils as vizUtils } from '@tidepool/viz';
const { GLYCEMIC_RANGE } = vizUtils.constants;

export const getDismissedAltRangeBannerKey = clinicId => `dismissedClinicAltRangeBannerTime-${clinicId}`;

export const getDismissedAltRangeNotificationKey = clinicId => `dismissedClinicAltRangeNotificationTime-${clinicId}`;

export const isRangeWithNonStandardTarget = (glycemicRanges) => (
  glycemicRanges === GLYCEMIC_RANGE.ADA_PREGNANCY_T1 ||
  glycemicRanges === GLYCEMIC_RANGE.ADA_GESTATIONAL_T2
);
