/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global expect */

import _ from 'lodash';

import { devices as reducer } from '../../../../app/redux/reducers/misc';

import * as actions from '../../../../app/redux/actions/index';

var expect = chai.expect;

describe('devices', () => {
  describe('fetchDevicesSuccess', () => {
    it('should set devices to state', () => {
      let initialStateForTest = {};

      let devices = {
        cgms: [{ id: 'cgm' }],
        pumps: [{ id: 'pump' }],
      };

      let action = actions.sync.fetchDevicesSuccess(devices);

      let state = reducer(initialStateForTest, action);

      expect(state.cgms[0].id).to.equal('cgm');
      expect(state.cgms.length).to.equal(1);

      expect(state.pumps[0].id).to.equal('pump');
      expect(state.pumps.length).to.equal(1);
    });
  });
});
