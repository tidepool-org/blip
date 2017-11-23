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

import * as patients from '../../data/patient/profiles';
import * as misc from '../../src/utils/misc';

describe('misc utility functions', () => {
  describe('getPatientFullName', () => {
    const {
      standard,
      fakeChildAcct,
    } = patients;

    it('should be a function', () => {
      assert.isFunction(misc.getPatientFullName);
    });

    it('returns patient name', () => {
      expect(misc.getPatientFullName(standard)).to.equal(standard.profile.fullName);
    });

    it('returns child name when isOtherPerson', () => {
      expect(misc.getPatientFullName(fakeChildAcct))
        .to.equal(fakeChildAcct.profile.patient.fullName);
    });
  });
});
