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
/* global beforeEach */

import _ from 'lodash';
import * as ActionTypes from '../../../../app/redux/constants/actionTypes';
import trackingMiddleware from '../../../../app/redux/utils/trackingMiddleware';

describe('trackingMiddleware', () => {
  const api = {
    metrics: {
      track: sinon.spy()
    }
  };
  const getStateObj = {
    getState: sinon.stub()
  };
  const next = sinon.stub();

  beforeEach(() => {
    api.metrics.track.resetHistory();
  });

  it('should be a function', () => {
    expect(trackingMiddleware).to.be.a('function');
  });

  it('should call the metrics api for SIGNUP_SUCCESS', () => {
    const signupSuccess = {
      type: ActionTypes.SIGNUP_SUCCESS,
      payload: {
        user: {},
      },
    };
    expect(api.metrics.track.callCount).to.equal(0);
    trackingMiddleware(api)(getStateObj)(next)(signupSuccess);
    expect(api.metrics.track.calledWith('Signed Up')).to.be.true;
    expect(api.metrics.track.calledWith('Web - Personal Account Created')).to.be.true;
    expect(api.metrics.track.callCount).to.equal(2);
  });

  it('should call the metrics api for SIGNUP_SUCCESS with roles', () => {
    const signupSuccess = {
      type: ActionTypes.SIGNUP_SUCCESS,
      payload: {
        user: {
          roles: ['clinic'],
          ignored: true
        },
        ignored: true
      },
      ignored: true
    };
    expect(api.metrics.track.callCount).to.equal(0);
    trackingMiddleware(api)(getStateObj)(next)(signupSuccess);
    expect(api.metrics.track.calledWith('Signed Up', { roles: ['clinic'] })).to.be.true;
    expect(api.metrics.track.calledWith('Web - Clinician Account Created')).to.be.true;
    expect(api.metrics.track.callCount).to.equal(2);
  });

  it('should call the metrics api for LOGIN_SUCCESS', () => {
    const loginSuccess = {
      type: ActionTypes.LOGIN_SUCCESS
    };
    expect(api.metrics.track.callCount).to.equal(0);
    trackingMiddleware(api)(getStateObj)(next)(loginSuccess);
    expect(api.metrics.track.callCount).to.equal(1);
    expect(api.metrics.track.calledWith('Logged In')).to.be.true;
  });

  it('should call the metrics api for SETUP_DATA_STORAGE_SUCCESS', () => {
    const createdProfile = {
      type: ActionTypes.SETUP_DATA_STORAGE_SUCCESS,
      payload: {
        patient: {
          profile: {
            patient: {
              diagnosisType: 'type1',
            },
          },
        },
      },
    };
    expect(api.metrics.track.callCount).to.equal(0);
    trackingMiddleware(api)(getStateObj)(next)(createdProfile);
    expect(api.metrics.track.callCount).to.equal(1);
    sinon.assert.calledWith(api.metrics.track, 'Created Profile', { 'Diabetes Type': 'type1' });
  });

  it('should call the metrics api for UPDATE_PATIENT_SUCCESS', () => {
    const updatedProfile = {
      type: ActionTypes.UPDATE_PATIENT_SUCCESS
    };
    expect(api.metrics.track.callCount).to.equal(0);
    trackingMiddleware(api)(getStateObj)(next)(updatedProfile);
    expect(api.metrics.track.callCount).to.equal(1);
    expect(api.metrics.track.calledWith('Updated Profile')).to.be.true;
  });

  it('should call the metrics api for UPDATE_USER_SUCCESS', () => {
    const updatedAccount = {
      type: ActionTypes.UPDATE_USER_SUCCESS
    };
    expect(api.metrics.track.callCount).to.equal(0);
    trackingMiddleware(api)(getStateObj)(next)(updatedAccount);
    expect(api.metrics.track.callCount).to.equal(1);
    expect(api.metrics.track.calledWith('Updated Account')).to.be.true;
  });

  it('should call the metrics api for LOGOUT_REQUEST', () => {
    const loggedOut = {
      type: ActionTypes.LOGOUT_REQUEST
    };
    expect(api.metrics.track.callCount).to.equal(0);
    trackingMiddleware(api)(getStateObj)(next)(loggedOut);
    expect(api.metrics.track.callCount).to.equal(1);
    expect(api.metrics.track.calledWith('Logged Out')).to.be.true;
  });

  it('should call the metrics api for VERIFY_CUSTODIAL_SUCCESS', () => {
    const verifyCustodial = {
      type: ActionTypes.VERIFY_CUSTODIAL_SUCCESS
    };
    expect(api.metrics.track.callCount).to.equal(0);
    trackingMiddleware(api)(getStateObj)(next)(verifyCustodial);
    expect(api.metrics.track.callCount).to.equal(1);
    expect(api.metrics.track.calledWith('VCA Home Verification - Verified')).to.be.true;
  });

  it('should call the metrics api for TURN_ON_CBG_RANGE, "100"', () => {
    const turnOn100 = {
      type: 'TURN_ON_CBG_RANGE',
      payload: {
        range: '100'
      }
    };
    const metricString = 'Turn on 100' + encodeURIComponent('%');
    expect(api.metrics.track.callCount).to.equal(0);
    trackingMiddleware(api)(getStateObj)(next)(turnOn100);
    expect(api.metrics.track.callCount).to.equal(1);
    expect(api.metrics.track.calledWith(metricString)).to.be.true;
  });

  it('should call the metrics api for TURN_ON_CBG_RANGE, "80"', () => {
    const turnOn80 = {
      type: 'TURN_ON_CBG_RANGE',
      payload: {
        range: '80'
      }
    };
    const metricString = 'Turn on 80' + encodeURIComponent('%');
    expect(api.metrics.track.callCount).to.equal(0);
    trackingMiddleware(api)(getStateObj)(next)(turnOn80);
    expect(api.metrics.track.callCount).to.equal(1);
    expect(api.metrics.track.calledWith(metricString)).to.be.true;
  });

  it('should call the metrics api for TURN_ON_CBG_RANGE, "median"', () => {
    const turnOnMedian = {
      type: 'TURN_ON_CBG_RANGE',
      payload: {
        range: 'median'
      }
    };
    const metricString = 'Turn on median';
    expect(api.metrics.track.callCount).to.equal(0);
    trackingMiddleware(api)(getStateObj)(next)(turnOnMedian);
    expect(api.metrics.track.callCount).to.equal(1);
    expect(api.metrics.track.calledWith(metricString)).to.be.true;
  });

  it('should call the metrics api for TURN_OFF_CBG_RANGE, "100"', () => {
    const turnOff100 = {
      type: 'TURN_OFF_CBG_RANGE',
      payload: {
        range: '100'
      }
    };
    const metricString = 'Turn off 100' + encodeURIComponent('%');
    expect(api.metrics.track.callCount).to.equal(0);
    trackingMiddleware(api)(getStateObj)(next)(turnOff100);
    expect(api.metrics.track.callCount).to.equal(1);
    expect(api.metrics.track.calledWith(metricString)).to.be.true;
  });

  it('should call the metrics api for TURN_OFF_CBG_RANGE, "80"', () => {
    const turnOff80 = {
      type: 'TURN_OFF_CBG_RANGE',
      payload: {
        range: '80'
      }
    };
    const metricString = 'Turn off 80' + encodeURIComponent('%');
    expect(api.metrics.track.callCount).to.equal(0);
    trackingMiddleware(api)(getStateObj)(next)(turnOff80);
    expect(api.metrics.track.callCount).to.equal(1);
    expect(api.metrics.track.calledWith(metricString)).to.be.true;
  });

  it('should call the metrics api for TURN_OFF_CBG_RANGE, "median"', () => {
    const turnOffMedian = {
      type: 'TURN_OFF_CBG_RANGE',
      payload: {
        range: 'median'
      }
    };
    const metricString = 'Turn off median';
    expect(api.metrics.track.callCount).to.equal(0);
    trackingMiddleware(api)(getStateObj)(next)(turnOffMedian);
    expect(api.metrics.track.callCount).to.equal(1);
    expect(api.metrics.track.calledWith(metricString)).to.be.true;
  });
});
