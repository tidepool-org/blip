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

import { BG_HIGH, BG_LOW, MGDL_UNITS, MMOLL_UNITS } from '../../src/utils/constants';

import * as format from '../../src/utils/format';

describe('format', () => {
  describe('displayDecimal', () => {
    it('should give no places when none specified', () => {
      expect(format.displayDecimal(9.3328)).to.equal('9');
    });

    it('should give no places when zero specified', () => {
      expect(format.displayDecimal(9.3328, 0)).to.equal('9');
    });

    it('should give the number of places when they are specified', () => {
      expect(format.displayDecimal(9.3328, 1)).to.equal('9.3');
    });
  });

  describe('displayBgValue', () => {
    it('should be a function', () => {
      assert.isFunction(format.displayBgValue);
    });

    describe('no recogizable units provided', () => {
      it('should return a String integer by default (no recogizable `units` provided)', () => {
        expect(format.displayBgValue(120.5)).to.equal('121');
        expect(format.displayBgValue(120.5, 'foo')).to.equal('121');
      });
    });

    describe('when units are `mg/dL`', () => {
      it('should return a String integer', () => {
        expect(format.displayBgValue(120.5, MGDL_UNITS)).to.equal('121');
      });

      it('should give no decimals', () => {
        expect(format.displayBgValue(352, MGDL_UNITS)).to.equal('352');
      });

      it('should round', () => {
        expect(format.displayBgValue(352.77, MGDL_UNITS)).to.equal('353');
      });

      describe('when `outOfRangeThresholds` provided', () => {
        it('should return the String High if value over the high threshold', () => {
          expect(format.displayBgValue(401, MGDL_UNITS, { high: 400 })).to.equal(BG_HIGH);
        });

        it('should return normal String integer if value NOT over the high threshold', () => {
          expect(format.displayBgValue(399, MGDL_UNITS, { high: 400 })).to.equal('399');
        });

        it('should return the String Low if value under the low threshold', () => {
          expect(format.displayBgValue(39, MGDL_UNITS, { low: 40 })).to.equal(BG_LOW);
        });

        it('should return normal String integer if value NOT under the low threshold', () => {
          expect(format.displayBgValue(41, MGDL_UNITS, { low: 40 })).to.equal('41');
        });
      });
    });

    describe('when units are `mmol/L`', () => {
      it('should return a String number', () => {
        expect(format.displayBgValue(6.6886513292098675, MMOLL_UNITS)).to.equal('6.7');
      });

      it('should give one decimal place', () => {
        expect(format.displayBgValue(12.52, MMOLL_UNITS)).to.equal('12.5');
      });

      it('should round', () => {
        expect(format.displayBgValue(12.77, MMOLL_UNITS)).to.equal('12.8');
      });

      describe('when `outOfRangeThresholds` provided', () => {
        it('should return the String High if value over the high threshold', () => {
          expect(format.displayBgValue(23.1, MMOLL_UNITS, { high: 400 })).to.equal(BG_HIGH);
        });

        it('should return normal String number if value NOT over the high threshold', () => {
          expect(format.displayBgValue(22.0, MMOLL_UNITS, { high: 400 })).to.equal('22.0');
        });

        it('should return the String Low if value under the low threshold', () => {
          expect(format.displayBgValue(2.1, MMOLL_UNITS, { low: 40 })).to.equal(BG_LOW);
        });

        it('should return normal String number if value NOT under the low threshold', () => {
          expect(format.displayBgValue(3.36, MMOLL_UNITS, { low: 40 })).to.equal('3.4');
        });
      });
    });
  });

  const patient = {
    profile: {
      fullName: 'Mary Smith',
      patient: {
        diagnosisDate: '1990-01-31',
        birthday: '1983-01-31',
      },
    },
  };

  const patientKid = {
    profile: {
      fullName: 'Mary Smith',
      patient: {
        isOtherPerson: true,
        fullName: 'My Kid',
        diagnosisDate: '1990-01-31',
        birthday: '1983-01-31',
      },
    },
  };

  describe('patientFullName', () => {
    it('should be a function', () => {
      assert.isFunction(format.patientFullName);
    });

    it('returns patient name', () => {
      expect(format.patientFullName(patient)).to.equal(patient.profile.fullName);
    });

    it('returns child name when isOtherPerson', () => {
      expect(format.patientFullName(patientKid)).to.equal(patientKid.profile.patient.fullName);
    });
  });

  describe('birthday', () => {
    it('should be a function', () => {
      assert.isFunction(format.birthday);
    });
    it('returns child name when isOtherPerson', () => {
      expect(format.birthday(patientKid)).to.equal('Jan 31, 1983');
    });
    it('returns child name when isOtherPerson', () => {
      expect(format.birthday(patientKid)).to.equal('Jan 31, 1983');
    });
  });

  describe('diagnosisDate', () => {
    it('should be a function', () => {
      assert.isFunction(format.diagnosisDate);
    });
    it('returns child name when isOtherPerson', () => {
      expect(format.diagnosisDate(patient)).to.equal('Jan 31, 1990');
    });
    it('returns child name when isOtherPerson', () => {
      expect(format.diagnosisDate(patient)).to.equal('Jan 31, 1990');
    });
  });
});
