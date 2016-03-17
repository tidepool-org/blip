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

/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global expect */

import _ from 'lodash';

import mutationTracker from 'object-invariant-test-helper';

import { notification as reducer } from '../../../../app/redux/reducers/misc';

import actions from '../../../../app/redux/actions/index';

import * as ErrorMessages from '../../../../app/redux/constants/errorMessages';

import { notification as initialState } from '../../../../app/redux/reducers/initialState';

var expect = chai.expect;

describe('notification', () => {
  describe('showNotification', () => {
    it('should set notification to payload.notification', () => {
      let notification = 'Some notification'
      let initialStateForTest = null;
      let tracked = mutationTracker.trackObj(initialStateForTest);

      let action = actions.sync.showNotification(notification)

      let state = reducer(initialStateForTest, action);
      expect(state).to.equal(notification);
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });
  describe('acknowledgeNotification', () => {
    it('should clear notification state when no acknowledgeNotificationKey specified in payload', () => {
      let notification = 'Some notification'
      let initialStateForTest = notification;
      let tracked = mutationTracker.trackObj(initialStateForTest);

      let action = actions.sync.acknowledgeNotification()

      expect(initialStateForTest).to.equal(notification);

      let state = reducer(initialStateForTest, action);
      expect(state).to.be.null;
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });

    it('should not clear notification state when a acknowledgeNotificationKey is specified in payload', () => {
      let notification = 'Some notification'
      let initialStateForTest = notification;
      let tracked = mutationTracker.trackObj(initialStateForTest);

      let action = actions.sync.acknowledgeNotification('someAcknowledgementKey')

      expect(initialStateForTest).to.equal(notification);

      let state = reducer(initialStateForTest, action);
      expect(state).to.equal(notification);
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });
  });
});