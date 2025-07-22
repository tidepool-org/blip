/* global jest */
/* global describe */
/* global it */
/* global expect */
/* global beforeEach */
/* global before */
/* global afterEach */
/* global after */
/* global context */

import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import trackingMiddleware from '../../../../../app/redux/utils/trackingMiddleware';
import moment from 'moment';
import _ from 'lodash';

import isTSA from 'tidepool-standard-action';

import initialState from '../../../../../app/redux/reducers/initialState';

import * as ErrorMessages from '../../../../../app/redux/constants/errorMessages';
import * as UserMessages from '../../../../../app/redux/constants/usrMessages';

// need to require() async in order to rewire utils inside
const async = require('../../../../../app/redux/actions/async');
const sync = require('../../../../../app/redux/actions/sync');

describe('Actions', () => {
  const trackMetric = jest.fn();
  const mockStore = configureStore([
    thunk,
    trackingMiddleware({ metrics: { track: trackMetric } }),
  ]);

  describe('Asynchronous Actions', () => {
    describe('createClinicSite', () => {
      it('should trigger CREATE_CLINIC_SITE_SUCCESS and it should call clinics.createClinicSite once for a successful request', () => {
        const clinicId = 'clinicId1';
        const updatedSites = [{ id: 'site-alpha-id', name: 'Site Alpha' }];

        let api = {
          clinics: {
            createClinicSite: jest.fn().mockImplementation((_arg1, _arg2, cb) => cb(null, updatedSites)),
          },
        };

        let expectedActions = [
          { type: 'CREATE_CLINIC_SITE_REQUEST' },
          { type: 'CREATE_CLINIC_SITE_SUCCESS', payload: { clinicId, sites: updatedSites } },
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).toBe(true);
        });

        let store = mockStore({ blip: initialState });
        store.dispatch(async.createClinicSite(api, clinicId, { name: 'Site Alpha' }));

        const actions = store.getActions();
        expect(actions).toStrictEqual(expectedActions);
        expect(api.clinics.createClinicSite).toHaveBeenCalledTimes(1);
      });

      it('should trigger CREATE_CLINIC_SITE_FAILURE and it should call error once for a failed request', () => {
        let clinicId = 'clinicId1';

        let api = {
          clinics: {
            createClinicSite: jest.fn().mockImplementation((_arg1, _arg2, cb) => cb({ status: 500, body: 'Error!' }, null)),
          },
        };

        let err = new Error(ErrorMessages.ERR_CREATING_CLINIC_SITE);
        err.status = 500;

        let expectedActions = [
          { type: 'CREATE_CLINIC_SITE_REQUEST' },
          { type: 'CREATE_CLINIC_SITE_FAILURE', error: err, meta: { apiError: { status: 500, body: 'Error!' } } },
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).toBe(true);
        });
        let store = mockStore({ blip: initialState });
        store.dispatch(async.createClinicSite(api, clinicId, { name: 'Site Charlie' }));

        const actions = store.getActions();
        expect(actions).toStrictEqual(expectedActions);
        expect(api.clinics.createClinicSite).toHaveBeenCalledTimes(1);
      });
    });
  });
});
