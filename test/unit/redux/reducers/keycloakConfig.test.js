/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global expect */

import _ from 'lodash';

import { keycloakConfig as reducer } from '../../../../app/redux/reducers/misc';

import * as actions from '../../../../app/redux/actions/index';

var expect = chai.expect;

describe('keycloakConfig', () => {
  describe('fetchInfoSuccess', () => {
    it('should set state to info auth key', () => {
      let initialStateForTest = {};
      let info = {
        auth: {
          url: 'someUrl',
          realm: 'anAwesomeRealm',
        },
      };

      let action = actions.sync.fetchInfoSuccess(info);
      let state = reducer(initialStateForTest, action);
      expect(state.url).to.equal('someUrl');
      expect(state.realm).to.equal('anAwesomeRealm');
    });
  });

  describe('keycloakReady', () => {
    it('should set initialized state to true', () => {
      let initialStateForTest = {};

      let action = actions.sync.keycloakReady();
      let state = reducer(initialStateForTest, action);
      expect(state.initialized).to.be.true;
    });
  });
});
