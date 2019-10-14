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

import * as constants from '../../src/utils/constants';

describe('constants', () => {
  describe('BG_HIGH', () => {
    it('should be `High`', () => {
      expect(constants.BG_HIGH).to.equal('High');
    });
  });

  describe('BG_LOW', () => {
    it('should be `Low`', () => {
      expect(constants.BG_LOW).to.equal('Low');
    });
  });

  describe('MGDL_CLAMP_TOP', () => {
    it('should be `400`', () => {
      expect(constants.MGDL_CLAMP_TOP).to.equal(400);
    });
  });

  describe('MMOLL_CLAMP_TOP', () => {
    it('should be `22.5`', () => {
      expect(constants.MMOLL_CLAMP_TOP).to.equal(22.5);
    });
  });

  describe('MMOLL_UNITS', () => {
    it('should be `mmol/L`', () => {
      expect(constants.MMOLL_UNITS).to.equal('mmol/L');
    });
  });

  describe('MGDL_UNITS', () => {
    it('should be `mg/dL`', () => {
      expect(constants.MGDL_UNITS).to.equal('mg/dL');
    });
  });

  describe('MGDL_PER_MMOLL', () => {
    it('should be `18.01559`', () => {
      expect(constants.MGDL_PER_MMOLL).to.equal(18.01559);
    });
  });

  describe('LBS_PER_KG', () => {
    it('should be `2.2046226218`', () => {
      expect(constants.LBS_PER_KG).to.equal(2.2046226218);
    });
  });

  describe('CGM_READINGS_ONE_DAY', () => {
    it('should be `288`', () => {
      expect(constants.CGM_READINGS_ONE_DAY).to.equal(288);
    });
  });

  describe('MS_IN_DAY', () => {
    it('should be `864e5`', () => {
      expect(constants.MS_IN_DAY).to.equal(864e5);
    });
  });

  describe('MS_IN_HOUR', () => {
    it('should be `864e5 / 24`', () => {
      expect(constants.MS_IN_HOUR).to.equal(864e5 / 24);
    });
  });

  describe('MS_IN_MIN', () => {
    it('should be `MS_IN_HOUR / 60`', () => {
      expect(constants.MS_IN_MIN).to.equal(constants.MS_IN_HOUR / 60);
    });
  });

  describe('CGM_DATA_KEY', () => {
    it('should be `cbg`', () => {
      expect(constants.CGM_DATA_KEY).to.equal('cbg');
    });
  });

  describe('BGM_DATA_KEY', () => {
    it('should be `smbg`', () => {
      expect(constants.BGM_DATA_KEY).to.equal('smbg');
    });
  });

  describe('NO_CGM', () => {
    it('should be `noCGM`', () => {
      expect(constants.NO_CGM).to.equal('noCGM');
    });
  });

  describe('CGM_CALCULATED', () => {
    it('should be `calculatedCGM`', () => {
      expect(constants.CGM_CALCULATED).to.equal('calculatedCGM');
    });
  });

  describe('NOT_ENOUGH_CGM', () => {
    it('should be `notEnoughCGM`', () => {
      expect(constants.NOT_ENOUGH_CGM).to.equal('notEnoughCGM');
    });
  });

  describe('NO_SITE_CHANGE', () => {
    it('should be `noSiteChange`', () => {
      expect(constants.NO_SITE_CHANGE).to.equal('noSiteChange');
    });
  });

  describe('SITE_CHANGE', () => {
    it('should be `siteChange`', () => {
      expect(constants.SITE_CHANGE).to.equal('siteChange');
    });
  });

  describe('SITE_CHANGE_RESERVOIR', () => {
    it('should be `reservoirChange`', () => {
      expect(constants.SITE_CHANGE_RESERVOIR).to.equal('reservoirChange');
    });
  });

  describe('SITE_CHANGE_TUBING', () => {
    it('should be `tubingPrime`', () => {
      expect(constants.SITE_CHANGE_TUBING).to.equal('tubingPrime');
    });
  });

  describe('SITE_CHANGE_CANNULA', () => {
    it('should be `cannulaPrime`', () => {
      expect(constants.SITE_CHANGE_CANNULA).to.equal('cannulaPrime');
    });
  });

  describe('AUTOMATED_DELIVERY', () => {
    it('should be `automatedDelivery`', () => {
      expect(constants.AUTOMATED_DELIVERY).to.equal('automatedDelivery');
    });
  });

  describe('SCHEDULED_DELIVERY', () => {
    it('should be `scheduledDelivery`', () => {
      expect(constants.SCHEDULED_DELIVERY).to.equal('scheduledDelivery');
    });
  });

  describe('SECTION_TYPE_UNDECLARED', () => {
    it('should be `undeclared`', () => {
      expect(constants.SECTION_TYPE_UNDECLARED).to.equal('undeclared');
    });
  });

  describe('INSULET', () => {
    it('should be `Insulet`', () => {
      expect(constants.INSULET).to.equal('Insulet');
    });
  });

  describe('TANDEM', () => {
    it('should be `Tandem`', () => {
      expect(constants.TANDEM).to.equal('Tandem');
    });
  });

  describe('ANIMAS', () => {
    it('should be `Animas`', () => {
      expect(constants.ANIMAS).to.equal('Animas');
    });
  });

  describe('MEDTRONIC', () => {
    it('should be `Medtronic`', () => {
      expect(constants.MEDTRONIC).to.equal('Medtronic');
    });
  });

  describe('pumpVocabulary', () => {
    it('should define common terms per device manufacturer', () => {
      expect(constants.pumpVocabulary).to.eql({
        [constants.ANIMAS]: {
          [constants.SITE_CHANGE_RESERVOIR]: 'Go Rewind',
          [constants.SITE_CHANGE_TUBING]: 'Go Prime',
          [constants.SITE_CHANGE_CANNULA]: 'Fill Cannula',
        },
        [constants.INSULET]: {
          [constants.SITE_CHANGE_RESERVOIR]: 'Change Pod',
          [constants.SITE_CHANGE_TUBING]: 'Activate Pod',
          [constants.SITE_CHANGE_CANNULA]: 'Prime',
        },
        [constants.MEDTRONIC]: {
          [constants.SITE_CHANGE_RESERVOIR]: 'Rewind',
          [constants.SITE_CHANGE_TUBING]: 'Prime',
          [constants.SITE_CHANGE_CANNULA]: 'Prime Cannula',
          [constants.AUTOMATED_DELIVERY]: 'Auto Mode',
          [constants.SCHEDULED_DELIVERY]: 'Manual',
        },
        [constants.TANDEM]: {
          [constants.SITE_CHANGE_RESERVOIR]: 'Change Cartridge',
          [constants.SITE_CHANGE_TUBING]: 'Fill Tubing',
          [constants.SITE_CHANGE_CANNULA]: 'Fill Cannula',
        },
        [constants.DIABELOOP]: {
          [constants.SITE_CHANGE_RESERVOIR]: 'Change Cartridge',
          [constants.AUTOMATED_DELIVERY]: 'Loop mode',
          [constants.SCHEDULED_DELIVERY]: 'Loop mode off',
        },
        default: {
          [constants.SITE_CHANGE_RESERVOIR]: 'Change Cartridge',
          [constants.SITE_CHANGE_TUBING]: 'Fill Tubing',
          [constants.SITE_CHANGE_CANNULA]: 'Fill Cannula',
          [constants.AUTOMATED_DELIVERY]: 'Automated',
          [constants.SCHEDULED_DELIVERY]: 'Manual',
        },
      });
    });
  });

  describe('AUTOMATED_BASAL_DEVICE_MODELS', () => {
    it('should define automated basal models per device manufacturer', () => {
      expect(constants.AUTOMATED_BASAL_DEVICE_MODELS).to.eql({
        [constants.MEDTRONIC]: ['1580', '1581', '1582', '1780', '1781', '1782'],
        [constants.DIABELOOP]: ['DBLG1'],
      });
    });
  });
});
