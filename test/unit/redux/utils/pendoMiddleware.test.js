/* global sinon */
/* global describe */
/* global it */
/* global expect */
/* global beforeEach */

import * as ActionTypes from '../../../../app/redux/constants/actionTypes';
import pendoMiddleware from '../../../../app/redux/utils/pendoMiddleware';

describe('pendoMiddleware', () => {
  const api = {};
  const emptyState = {
    router: {
      location: {
        query: {},
      },
    },
    blip: {
      clinics: {},
      allUsersMap: {},
      loggedInUserId: '',
    },
  };
  const getStateObj = {
    getState: sinon.stub().returns(emptyState),
  };
  const next = sinon.stub();

  pendoMiddleware.__Rewire__('config', { PENDO_ENABLED: true });

  const winMock = {
    location: {
      hostname: 'localhost',
    },
    pendo: {
      initialize: sinon.stub(),
      updateOptions: sinon.stub(),
    },
  };

  beforeEach(() => {
    winMock.pendo.initialize.resetHistory();
    winMock.pendo.updateOptions.resetHistory();
    getStateObj.getState.returns(emptyState);
  });

  it('should be a function', () => {
    expect(pendoMiddleware).to.be.a('function');
  });

  it('should not call initialize for LOGIN_SUCCESS if not PENDO_ENABLED', () => {
    pendoMiddleware.__Rewire__('config', { PENDO_ENABLED: false });
    const loginSuccess = {
      type: ActionTypes.LOGIN_SUCCESS,
      payload: {
        user: {},
      },
    };
    getStateObj.getState.returns({
      ...emptyState,
      ...{
        blip: {
          clinics: {
            clinicID123: {
              clinicians: { userID345: { roles: ['CLINIC_ADMIN'] } },
              name: 'Mock Clinic Name',
            },
          },
          loggedInUserId: 'userID345',
          allUsersMap: {
            userID345: { userid: 'userID345', roles: ['migrated_clinic'] },
          },
        },
      },
    });

    expect(winMock.pendo.initialize.callCount).to.equal(0);
    pendoMiddleware(api, winMock)(getStateObj)(next)(loginSuccess);
    expect(winMock.pendo.initialize.callCount).to.equal(0);
    pendoMiddleware.__Rewire__('config', { PENDO_ENABLED: true });
  });

  it('should not call initialize if noPendo query is set', () => {
    const loginSuccess = {
      type: ActionTypes.LOGIN_SUCCESS,
      payload: {
        user: {},
      },
    };
    getStateObj.getState.returns({
      ...emptyState,
      ...{
        router: {
          location: {
            query: {
              noPendo: true,
            },
          },
        },
        blip: {
          clinics: {
            clinicID123: {
              clinicians: { userID345: { roles: ['CLINIC_ADMIN'] } },
              name: 'Mock Clinic Name',
            },
          },
          loggedInUserId: 'userID345',
          allUsersMap: {
            userID345: { userid: 'userID345', roles: ['migrated_clinic'] },
          },
        },
      },
    });

    expect(winMock.pendo.initialize.callCount).to.equal(0);
    pendoMiddleware(api, winMock)(getStateObj)(next)(loginSuccess);
    expect(winMock.pendo.initialize.callCount).to.equal(0);
  });

  it('should call initialize for LOGIN_SUCCESS', () => {
    const loginSuccess = {
      type: ActionTypes.LOGIN_SUCCESS,
      payload: {
        user: {},
      },
    };
    getStateObj.getState.returns({
      ...emptyState,
      ...{
        blip: {
          clinics: {
            clinicID123: {
              clinicians: { userID345: { roles: ['CLINIC_ADMIN'] } },
              name: 'Mock Clinic Name',
            },
          },
          loggedInUserId: 'userID345',
          allUsersMap: {
            userID345: { userid: 'userID345', roles: ['migrated_clinic'] },
          },
        },
      },
    });
    const expectedConfig = {
      account: {
        clinic: 'Mock Clinic Name',
        id: 'local-tidepool',
      },
      visitor: {
        application: 'Web',
        id: 'local-userID345',
        permission: 'administrator',
        role: 'personal',
      },
    };
    expect(winMock.pendo.initialize.callCount).to.equal(0);
    pendoMiddleware(api, winMock)(getStateObj)(next)(loginSuccess);
    expect(winMock.pendo.initialize.callCount).to.equal(1);
    expect(winMock.pendo.initialize.calledWith(expectedConfig)).to.be.true;
  });

  it('should set not set clinic info on LOGIN_SUCCESS if multiple clinics available', () => {
    const loginSuccess = {
      type: ActionTypes.LOGIN_SUCCESS,
      payload: {
        user: {},
      },
    };
    getStateObj.getState.returns({
      ...emptyState,
      ...{
        blip: {
          clinics: {
            clinicID123: {
              clinicians: { userID345: { roles: ['CLINIC_ADMIN'] } },
              name: 'Mock Clinic Name',
            },
            clinicID987: {
              clinicians: { userID345: { roles: ['CLINIC_MEMBER'] } },
              name: 'Other Mock Clinic',
            },
          },
          loggedInUserId: 'userID345',
          allUsersMap: {
            userID345: { userid: 'userID345', roles: ['migrated_clinic'] },
          },
        },
      },
    });
    const expectedConfig = {
      account: {
        id: 'local-tidepool',
      },
      visitor: {
        application: 'Web',
        id: 'local-userID345',
        role: 'personal',
      },
    };
    expect(winMock.pendo.initialize.callCount).to.equal(0);
    pendoMiddleware(api, winMock)(getStateObj)(next)(loginSuccess);
    expect(winMock.pendo.initialize.callCount).to.equal(1);
    expect(winMock.pendo.initialize.calledWith(expectedConfig)).to.be.true;
  });

  it('should set the appropriate environment based on hostname', () => {
    const loginSuccess = {
      type: ActionTypes.LOGIN_SUCCESS,
      payload: {
        user: {},
      },
    };
    getStateObj.getState.returns({
      ...emptyState,
      ...{
        blip: {
          clinics: {
            clinicID123: {
              clinicians: { userID345: { roles: ['CLINIC_ADMIN'] } },
              name: 'Mock Clinic Name',
            },
          },
          loggedInUserId: 'userID345',
          allUsersMap: {
            userID345: { userid: 'userID345', roles: ['migrated_clinic'] },
          },
        },
      },
    });
    const expectedProdConfig = {
      account: {
        clinic: 'Mock Clinic Name',
        id: 'prd-tidepool',
      },
      visitor: {
        application: 'Web',
        id: 'prd-userID345',
        permission: 'administrator',
        role: 'personal',
      },
    };
    const expectedQA1Config = {
      account: {
        clinic: 'Mock Clinic Name',
        id: 'qa1-tidepool',
      },
      visitor: {
        application: 'Web',
        id: 'qa1-userID345',
        permission: 'administrator',
        role: 'personal',
      },
    };

    const prdWinMock = {
      ...winMock,
      ...{ location: { hostname: 'app.tidepool.org' } },
    };
    const qa1WinMock = {
      ...winMock,
      ...{ location: { hostname: 'qa1.development.tidepool.org' } },
    };

    expect(winMock.pendo.initialize.callCount).to.equal(0);
    pendoMiddleware(api, prdWinMock)(getStateObj)(next)(loginSuccess);
    expect(winMock.pendo.initialize.callCount).to.equal(1);
    expect(winMock.pendo.initialize.calledWith(expectedProdConfig)).to.be.true;
    winMock.pendo.initialize.resetHistory();

    expect(winMock.pendo.initialize.callCount).to.equal(0);
    pendoMiddleware(api, qa1WinMock)(getStateObj)(next)(loginSuccess);
    expect(winMock.pendo.initialize.callCount).to.equal(1);
    expect(winMock.pendo.initialize.calledWith(expectedQA1Config)).to.be.true;
  });

  it('should call update for SELECT_CLINIC', () => {
    const selectClinic = {
      type: ActionTypes.SELECT_CLINIC,
      payload: {
        clinicId: 'clinicID987',
      },
    };
    getStateObj.getState.returns({
      ...emptyState,
      ...{
        blip: {
          clinics: {
            clinicID123: {
              clinicians: { userID345: { roles: ['CLINIC_ADMIN'] } },
              name: 'Mock Clinic Name',
            },
            clinicID987: {
              clinicians: { userID345: { roles: ['CLINIC_MEMBER'] } },
              name: 'Other Mock Clinic',
            },
          },
          loggedInUserId: 'userID345',
          allUsersMap: {
            userID345: { userid: 'userID345', roles: ['migrated_clinic'] },
          },
        },
      },
    });
    const expectedConfig = {
      account: {
        clinic: 'Other Mock Clinic',
      },
      visitor: {
        permission: 'member',
      },
    };
    expect(winMock.pendo.updateOptions.callCount).to.equal(0);
    pendoMiddleware(api, winMock)(getStateObj)(next)(selectClinic);
    expect(winMock.pendo.updateOptions.callCount).to.equal(1);
    expect(winMock.pendo.updateOptions.calledWith(expectedConfig)).to.be.true;
  });

  it('should call update and clear properties for SELECT_CLINIC with clinicID null', () => {
    const selectClinic = {
      type: ActionTypes.SELECT_CLINIC,
      payload: {
        clinicId: null,
      },
    };
    getStateObj.getState.returns({
      ...emptyState,
      ...{
        blip: {
          clinics: {
            clinicID123: {
              clinicians: { userID345: { roles: ['CLINIC_ADMIN'] } },
              name: 'Mock Clinic Name',
            },
            clinicID987: {
              clinicians: { userID345: { roles: ['CLINIC_MEMBER'] } },
              name: 'Other Mock Clinic',
            },
          },
          loggedInUserId: 'userID345',
          allUsersMap: {
            userID345: { userid: 'userID345', roles: ['migrated_clinic'] },
          },
        },
      },
    });
    const expectedConfig = {
      account: {
        clinic: null,
      },
      visitor: {
        permission: null,
      },
    };
    expect(winMock.pendo.updateOptions.callCount).to.equal(0);
    pendoMiddleware(api, winMock)(getStateObj)(next)(selectClinic);
    expect(winMock.pendo.updateOptions.callCount).to.equal(1);
    expect(winMock.pendo.updateOptions.args[0][0]).to.eql(expectedConfig);
  });
});
