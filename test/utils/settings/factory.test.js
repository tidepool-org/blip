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

import * as factory from '../../../src/utils/settings/factory';

// import NonTandem from '../../../src/components/settings/nontandem/NonTandem';
import Tandem from '../../../src/components/settings/tandem/Tandem';

describe('factory', () => {
  describe('tandem', () => {
    it('settings container returned when given tandem', () => {
      const chart = factory.getChart('tandem');
      expect(chart).to.equal(Tandem);
    });

    it('settings container returned when given tAnDEM', () => {
      const chart = factory.getChart('tAnDEM');
      expect(chart).to.equal(Tandem);
    });
  });

  describe('error', () => {
    it('should throw when given unknown deviceType', () => {
      const fn = () => { factory.getChart('unknown'); };
      expect(fn)
        .to.throw('`deviceType` must one of `carelink`, `tandem`, `insulet` or `animas`');
    });
  });
});
