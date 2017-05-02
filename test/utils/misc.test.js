/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2017, Tidepool Project
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

import * as misc from '../../src/utils/misc';

describe('misc utility functions', () => {
  describe('getPatientFullName', () => {
    const patient = {
      profile: {
        fullName: 'Mary Smith',
        patient: {
          diagnosisDate: '1990-01-31',
          birthday: '1983-01-31',
        },
      },
    };

    const fakeChildAcct = {
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

    it('should be a function', () => {
      assert.isFunction(misc.getPatientFullName);
    });

    it('returns patient name', () => {
      expect(misc.getPatientFullName(patient)).to.equal(patient.profile.fullName);
    });

    it('returns child name when isOtherPerson', () => {
      expect(misc.getPatientFullName(fakeChildAcct))
        .to.equal(fakeChildAcct.profile.patient.fullName);
    });
  });
});
