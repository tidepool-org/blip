/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2016, Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 * == BSD2 LICENSE ==
 */

import _ from 'lodash';
import i18next from 'i18next';
const t = i18next.t.bind(i18next);

if (_.get(i18next, 'options.returnEmptyString') === undefined) {
  // Return key if no translation is present
  i18next.init({ returnEmptyString: false, nsSeparator: '|' });
}

export const BG_HIGH = t('High');
export const BG_LOW = t('Low');

const STIFFNESS = 180;
const DAMPING = 40;
const PRECISION = 0.1;

export const springConfig = { stiffness: STIFFNESS, damping: DAMPING, precision: PRECISION };

export const MGDL_CLAMP_TOP = 400;
export const MMOLL_CLAMP_TOP = 22.5;

export const MGDL_UNITS = 'mg/dL';
export const MMOLL_UNITS = 'mmol/L';
export const MGDL_PER_MMOLL = 18.01559;

export const LBS_PER_KG = 2.2046226218;

export const MS_IN_DAY = 864e5;
export const MS_IN_HOUR = 864e5 / 24;
export const MS_IN_MIN = MS_IN_HOUR / 60;

export const CGM_READINGS_ONE_DAY = 288;
export const CGM_DATA_KEY = 'cbg';
export const BGM_DATA_KEY = 'smbg';
export const NO_CGM = 'noCGM';
export const CGM_CALCULATED = 'calculatedCGM';
export const NOT_ENOUGH_CGM = 'notEnoughCGM';

export const NO_SITE_CHANGE = 'noSiteChange';
export const SITE_CHANGE = 'siteChange';
export const SITE_CHANGE_RESERVOIR = 'reservoirChange';
export const SITE_CHANGE_TUBING = 'tubingPrime';
export const SITE_CHANGE_CANNULA = 'cannulaPrime';

export const AUTOMATED_DELIVERY = 'automatedDelivery';
export const SCHEDULED_DELIVERY = 'scheduledDelivery';

export const SECTION_TYPE_UNDECLARED = 'undeclared';

export const INSULET = 'Insulet';
export const TANDEM = 'Tandem';
export const ANIMAS = 'Animas';
export const MEDTRONIC = 'Medtronic';
export const DIABELOOP = 'Diabeloop';
export const ROCHE = 'Roche';
export const VICENTRA = 'Vicentra';
export const DEFAULT_MANUFACTURER = 'default';

export const pumpVocabulary = {
  [ANIMAS]: {
    [SITE_CHANGE_RESERVOIR]: t('Go Rewind'),
    [SITE_CHANGE_TUBING]: t('Go Prime'),
    [SITE_CHANGE_CANNULA]: t('Fill Cannula'),
  },
  [INSULET]: {
    [SITE_CHANGE_RESERVOIR]: t('Change Pod'),
    [SITE_CHANGE_TUBING]: t('Activate Pod'),
    [SITE_CHANGE_CANNULA]: t('Prime'),
  },
  [MEDTRONIC]: {
    [SITE_CHANGE_RESERVOIR]: t('Rewind'),
    [SITE_CHANGE_TUBING]: t('Prime'),
    [SITE_CHANGE_CANNULA]: t('Prime Cannula'),
    [AUTOMATED_DELIVERY]: t('Auto Mode'),
    [SCHEDULED_DELIVERY]: t('Manual'),
  },
  [TANDEM]: {
    [SITE_CHANGE_RESERVOIR]: t('Change Cartridge'),
    [SITE_CHANGE_TUBING]: t('Fill Tubing'),
    [SITE_CHANGE_CANNULA]: t('Fill Cannula'),
  },
  [DIABELOOP]: {
    [SITE_CHANGE_RESERVOIR]: t('Change Cartridge'),
    [AUTOMATED_DELIVERY]: t('Loop mode'),
    [SCHEDULED_DELIVERY]: t('Loop mode off'),
  },
  default: {
    [SITE_CHANGE_RESERVOIR]: t('Change Cartridge'),
    [SITE_CHANGE_TUBING]: t('Fill Tubing'),
    [SITE_CHANGE_CANNULA]: t('Fill Cannula'),
    [AUTOMATED_DELIVERY]: t('Automated'),
    [SCHEDULED_DELIVERY]: t('Manual'),
  },
};

export const AUTOMATED_BASAL_DEVICE_MODELS = {
  [MEDTRONIC]: ['1580', '1581', '1582', '1780', '1781', '1782'],
  [DIABELOOP]: true,
};

export const PRESCRIPTOR_AUTO = 'auto';
export const PRESCRIPTOR_MODIFIED = 'hybrid';
export const PRESCRIPTOR_NONE = 'manual';

export const RESERVOIR_CHANGE = 'reservoir';
export const INFUSION_SITE_CHANGE = 'site';

export const SITE_CHANGE_BY_MANUFACTURER = {
  [DEFAULT_MANUFACTURER]: INFUSION_SITE_CHANGE,
  [ROCHE]: RESERVOIR_CHANGE,
  [VICENTRA]: RESERVOIR_CHANGE,
};