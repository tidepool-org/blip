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

import isTSA from '../../helpers/tidepoolStandardAction';

import * as actionTypes from '../../../src/redux/constants/actionTypes';
import * as actions from '../../../src/redux/actions/';

describe('settings action creators', () => {
  const userId = 'a1b2c3';

  describe('markSettingsViewed', () => {
    const action = actions.markSettingsViewed(userId);
    it('should be a TSA', () => {
      expect(isTSA(action)).to.be.true;
    });

    it('should create an action to marks settings viewed', () => {
      expect(action).to.deep.equal({
        type: actionTypes.MARK_SETTINGS_VIEWED,
        payload: { userId },
      });
    });
  });

  describe('toggleSettingsSection', () => {
    const deviceKey = 'acme';
    const scheduleOrProfileKey = 'weekday';
    const action = actions.toggleSettingsSection(userId, deviceKey, scheduleOrProfileKey);

    it('should be a TSA', () => {
      expect(isTSA(action)).to.be.true;
    });

    it('should create an action to toggle the expansion of a settings section', () => {
      expect(action).to.deep.equal({
        type: actionTypes.TOGGLE_SETTINGS_SECTION,
        payload: { deviceKey, scheduleOrProfileKey, userId },
      });
    });
  });
});
