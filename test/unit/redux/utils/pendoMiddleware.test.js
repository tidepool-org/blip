/* global sinon */
/* global describe */
/* global context */
/* global it */
/* global expect */
/* global beforeEach */

import * as ActionTypes from '../../../../app/redux/constants/actionTypes';
import pendoMiddleware, { parseDeviceKeyVersions } from '../../../../app/redux/utils/pendoMiddleware';
import _ from 'lodash';

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
      pendoData: {
        account: {},
        visitor: {},
      },
    },
  };
  const getStateObj = {
    getState: sinon.stub().returns(emptyState),
    dispatch: sinon.stub(),
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

  const users = {
    clinicAdminID: { userid: 'clinicAdminID', username: 'clinicAdminID@example.com', roles: ['CLINIC_ADMIN', 'clinician'], termsAccepted: '2020-02-02T00:00:00.000Z' },
    clinicMemberID: { userid: 'clinicMemberID', username: 'clinicMemberID@example.com', roles: ['CLINIC_MEMBER', 'clinician'], termsAccepted: '2021-02-02T00:00:00.000Z' },
    patientId: { userid: 'patientId', username: 'patientId@example.com', roles: [], termsAccepted: '2020-02-02T00:00:00.000Z', termsAccepted: '2022-02-02T00:00:00.000Z' },
    legacyClinicianID: { userid: 'legacyClinicianID', username: 'legacyClinicianID@example.com', roles: ['CLINIC_MEMBER', 'clinic'], termsAccepted: '2021-02-02T00:00:00.000Z' },
    migratedClinicianID: { userid: 'migratedClinicianID', username: 'migratedClinicianID@example.com', roles: ['CLINIC_MEMBER', 'migrated_clinic'], termsAccepted: '2021-02-02T00:00:00.000Z' },
  }

  const clinics = {
    clinicID123: {
      id: 'clinicID123',
      clinicians: _.pick(users, 'clinicAdminID'),
      name: 'Mock Clinic Name',
      tier: 'tier0200',
      createdTime: '2022-01-01T00:00:00.000Z',
      country: 'US',
    },
    clinicID987: {
      id: 'clinicID987',
      clinicians: _.pick(users, ['clinicAdminID', 'clinicMemberID']),
      name: 'Other Mock Clinic',
      tier: 'tier0100',
      createdTime: '2022-01-01T00:00:00.000Z',
      country: 'CA',
    },
  }

  beforeEach(() => {
    winMock.pendo.initialize.resetHistory();
    winMock.pendo.updateOptions.resetHistory();
    winMock.pendo.visitorId = undefined; // pendo uninitialized by default
    getStateObj.getState.returns(emptyState);
  });

  it('should be a function', () => {
    expect(pendoMiddleware).to.be.a('function');
  });

  it('should not call pendo for LOGIN_SUCCESS if not PENDO_ENABLED', () => {
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
          clinics: _.pick(clinics, 'clinicID123'),
          loggedInUserId: 'clinicAdminID',
          allUsersMap: _.pick(users, 'clinicAdminID'),
          pendoData: {
            account: {},
            visitor: {},
          },
        },
      },
    });

    expect(winMock.pendo.initialize.callCount).to.equal(0);
    expect(winMock.pendo.updateOptions.callCount).to.equal(0);
    pendoMiddleware(api, winMock)(getStateObj)(next)(loginSuccess);
    expect(winMock.pendo.initialize.callCount).to.equal(0);
    expect(winMock.pendo.updateOptions.callCount).to.equal(0);
    pendoMiddleware.__Rewire__('config', { PENDO_ENABLED: true });
  });

  it('should not call pendo if noPendo query is set', () => {
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
          clinics: _.pick(clinics, 'clinicID123'),
          loggedInUserId: 'clinicAdminID',
          allUsersMap: _.pick(users, 'clinicAdminID'),
          pendoData: {
            account: {},
            visitor: {},
          },
        },
      },
    });

    expect(winMock.pendo.initialize.callCount).to.equal(0);
    expect(winMock.pendo.updateOptions.callCount).to.equal(0);
    pendoMiddleware(api, winMock)(getStateObj)(next)(loginSuccess);
    expect(winMock.pendo.initialize.callCount).to.equal(0);
    expect(winMock.pendo.updateOptions.callCount).to.equal(0);
  });

  it('should call initialize for LOGIN_SUCCESS if pendo is not initialized', () => {
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
          clinics: _.pick(clinics, 'clinicID123'),
          loggedInUserId: 'clinicAdminID',
          allUsersMap: _.pick(users, 'clinicAdminID'),
          pendoData: {
            account: {},
            visitor: {},
          },
        },
      },
    });
    const expectedConfig = {
      account: {
        clinic: 'Mock Clinic Name',
        id: 'clinicID123',
      },
      visitor: {
        application: 'Web',
        environment: 'local',
        id: 'clinicAdminID',
        currentlyViewedDevices: [],
        currentlyViewedDataAnnotations: [],
        permission: 'administrator',
        role: 'clinician',
        domain: 'example.com',
        termsAccepted: '2020-02-02T00:00:00.000Z',
      },
    };
    expect(winMock.pendo.initialize.callCount).to.equal(0);
    pendoMiddleware(api, winMock)(getStateObj)(next)(loginSuccess);
    expect(winMock.pendo.initialize.callCount).to.equal(1);
    expect(winMock.pendo.initialize.getCall(0).args[0]).to.eql(expectedConfig);
    expect(winMock.pendo.initialize.calledWith(expectedConfig)).to.be.true;
  });

  it('should set the visitor.role appropriately to either personal or clinician accounts', () => {
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
          clinics: _.pick(clinics, 'clinicID123'),
          loggedInUserId: 'patientId',
          allUsersMap: users,
          pendoData: {
            account: {},
            visitor: {},
          },
        },
      },
    });
    expect(winMock.pendo.initialize.callCount).to.equal(0);
    pendoMiddleware(api, winMock)(getStateObj)(next)(loginSuccess);
    expect(winMock.pendo.initialize.calledWithMatch({ visitor: { id: 'patientId', role: 'personal' }})).to.be.true;

    getStateObj.getState.returns({
      ...emptyState,
      ...{
        blip: {
          clinics: _.pick(clinics, 'clinicID123'),
          loggedInUserId: 'clinicAdminID',
          allUsersMap: users,
          pendoData: {
            account: {},
            visitor: {},
          },
        },
      },
    });
    winMock.pendo.initialize.resetHistory();
    expect(winMock.pendo.initialize.callCount).to.equal(0);
    pendoMiddleware(api, winMock)(getStateObj)(next)(loginSuccess);
    expect(winMock.pendo.initialize.calledWithMatch({ visitor: { id: 'clinicAdminID', role: 'clinician' }})).to.be.true;

    getStateObj.getState.returns({
      ...emptyState,
      ...{
        blip: {
          clinics: _.pick(clinics, 'clinicID123'),
          loggedInUserId: 'clinicMemberID',
          allUsersMap: users,
          pendoData: {
            account: {},
            visitor: {},
          },
        },
      },
    });
    winMock.pendo.initialize.resetHistory();
    expect(winMock.pendo.initialize.callCount).to.equal(0);
    pendoMiddleware(api, winMock)(getStateObj)(next)(loginSuccess);
    expect(winMock.pendo.initialize.calledWithMatch({ visitor: { id: 'clinicMemberID', role: 'clinician' }})).to.be.true;

    getStateObj.getState.returns({
      ...emptyState,
      ...{
        blip: {
          clinics: _.pick(clinics, 'clinicID123'),
          loggedInUserId: 'legacyClinicianID',
          allUsersMap: users,
          pendoData: {
            account: {},
            visitor: {},
          },
        },
      },
    });
    winMock.pendo.initialize.resetHistory();
    expect(winMock.pendo.initialize.callCount).to.equal(0);
    pendoMiddleware(api, winMock)(getStateObj)(next)(loginSuccess);
    expect(winMock.pendo.initialize.calledWithMatch({ visitor: { id: 'legacyClinicianID', role: 'clinician' }})).to.be.true;

    getStateObj.getState.returns({
      ...emptyState,
      ...{
        blip: {
          clinics: _.pick(clinics, 'clinicID123'),
          loggedInUserId: 'migratedClinicianID',
          allUsersMap: users,
          pendoData: {
            account: {},
            visitor: {},
          },
        },
      },
    });
    winMock.pendo.initialize.resetHistory();
    expect(winMock.pendo.initialize.callCount).to.equal(0);
    pendoMiddleware(api, winMock)(getStateObj)(next)(loginSuccess);
    expect(winMock.pendo.initialize.calledWithMatch({ visitor: { id: 'migratedClinicianID', role: 'clinician' }})).to.be.true;
  });

  it('should include isSmartOnFhir true when SMART on FHIR data is present', () => {
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
          clinics: _.pick(clinics, 'clinicID123'),
          loggedInUserId: 'clinicAdminID',
          allUsersMap: _.pick(users, 'clinicAdminID'),
          smartOnFhirData: {
            patientId: 'smart-patient-123',
          },
          pendoData: {
            account: {},
            visitor: {},
          },
        },
      },
    });
    const expectedConfig = {
      account: {
        clinic: 'Mock Clinic Name',
        id: 'clinicID123',
      },
      visitor: {
        application: 'Web',
        environment: 'local',
        id: 'clinicAdminID',
        isSmartOnFhir: true,
        currentlyViewedDevices: [],
        currentlyViewedDataAnnotations: [],
        permission: 'administrator',
        role: 'clinician',
        domain: 'example.com',
        termsAccepted: '2020-02-02T00:00:00.000Z',
      },
    };
    expect(winMock.pendo.initialize.callCount).to.equal(0);
    pendoMiddleware(api, winMock)(getStateObj)(next)(loginSuccess);
    expect(winMock.pendo.initialize.callCount).to.equal(1);
    expect(winMock.pendo.initialize.getCall(0).args[0]).to.eql(expectedConfig);
    expect(winMock.pendo.initialize.calledWith(expectedConfig)).to.be.true;
  });

  it('should call updateOptions for LOGIN_SUCCESS if pendo is already initialized', () => {
    winMock.pendo.visitorId = 'clinicAdminID';

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
          clinics: _.pick(clinics, 'clinicID123'),
          loggedInUserId: 'clinicAdminID',
          allUsersMap: _.pick(users, 'clinicAdminID'),
          pendoData: {
            account: {},
            visitor: {},
          },
        },
      },
    });
    const expectedConfig = {
      account: {
        clinic: 'Mock Clinic Name',
        id: 'clinicID123',
      },
      visitor: {
        application: 'Web',
        environment: 'local',
        id: 'clinicAdminID',
        currentlyViewedDevices: [],
        currentlyViewedDataAnnotations: [],
        permission: 'administrator',
        role: 'clinician',
        domain: 'example.com',
        termsAccepted: '2020-02-02T00:00:00.000Z',
      },
    };
    expect(winMock.pendo.updateOptions.callCount).to.equal(0);
    pendoMiddleware(api, winMock)(getStateObj)(next)(loginSuccess);
    expect(winMock.pendo.updateOptions.callCount).to.equal(1);
    expect(winMock.pendo.updateOptions.getCall(0).args[0]).to.eql(expectedConfig);
    expect(winMock.pendo.updateOptions.calledWith(expectedConfig)).to.be.true;
  });

  it('should not set clinic info on LOGIN_SUCCESS if multiple clinics available and selectedClinicId state is not set', () => {
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
          clinics: _.pick(clinics, ['clinicID123', 'clinicID987']),
          loggedInUserId: 'clinicAdminID',
          allUsersMap: _.pick(users, 'clinicAdminID'),
          selectedClinicId: undefined,
          pendoData: {
            account: {},
            visitor: {},
          },
        },
      },
    });
    const expectedConfig = {
      account: {
        id: 'clinicAdminID',
      },
      visitor: {
        application: 'Web',
        environment: 'local',
        id: 'clinicAdminID',
        currentlyViewedDevices: [],
        currentlyViewedDataAnnotations: [],
        role: 'clinician',
        termsAccepted: '2020-02-02T00:00:00.000Z',
      },
    };
    expect(winMock.pendo.initialize.callCount).to.equal(0);
    pendoMiddleware(api, winMock)(getStateObj)(next)(loginSuccess);
    expect(winMock.pendo.initialize.callCount).to.equal(1);
    expect(winMock.pendo.initialize.getCall(0).args[0]).to.eql(expectedConfig);
    expect(winMock.pendo.initialize.calledWith(expectedConfig)).to.be.true;
  });

  it('should set clinic info on LOGIN_SUCCESS if multiple clinics available but selectedClinicId state is available', () => {
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
          clinics: _.pick(clinics, ['clinicID123', 'clinicID987']),
          loggedInUserId: 'clinicAdminID',
          allUsersMap: _.pick(users, 'clinicAdminID'),
          selectedClinicId: 'clinicID123',
          pendoData: {
            account: {},
            visitor: {},
          },
        },
      },
    });
    const expectedConfig = {
      account: {
        clinic: 'Mock Clinic Name',
        id: 'clinicID123',
      },
      visitor: {
        application: 'Web',
        environment: 'local',
        id: 'clinicAdminID',
        currentlyViewedDevices: [],
        currentlyViewedDataAnnotations: [],
        permission: 'administrator',
        role: 'clinician',
        domain: 'example.com',
        termsAccepted: '2020-02-02T00:00:00.000Z',
      },
    };
    expect(winMock.pendo.initialize.callCount).to.equal(0);
    pendoMiddleware(api, winMock)(getStateObj)(next)(loginSuccess);
    expect(winMock.pendo.initialize.callCount).to.equal(1);
    expect(winMock.pendo.initialize.getCall(0).args[0]).to.eql(expectedConfig);
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
          clinics: _.pick(clinics, 'clinicID123'),
          loggedInUserId: 'clinicAdminID',
          allUsersMap: _.pick(users, 'clinicAdminID'),
          pendoData: {
            account: {},
            visitor: {},
          },
        },
      },
    });
    const expectedProdConfig = {
      account: {
        clinic: 'Mock Clinic Name',
        id: 'clinicID123',
      },
      visitor: {
        application: 'Web',
        domain: 'example.com',
        environment: 'prd',
        id: 'clinicAdminID',
        currentlyViewedDevices: [],
        currentlyViewedDataAnnotations: [],
        permission: 'administrator',
        role: 'clinician',
        termsAccepted: '2020-02-02T00:00:00.000Z',
      },
    };
    const expectedQA1Config = {
      account: {
        clinic: 'Mock Clinic Name',
        id: 'clinicID123',
      },
      visitor: {
        application: 'Web',
        domain: 'example.com',
        environment: 'qa1',
        id: 'clinicAdminID',
        currentlyViewedDevices: [],
        currentlyViewedDataAnnotations: [],
        permission: 'administrator',
        role: 'clinician',
        termsAccepted: '2020-02-02T00:00:00.000Z',
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
    expect(winMock.pendo.initialize.getCall(0).args[0]).to.eql(expectedProdConfig);
    expect(winMock.pendo.initialize.calledWith(expectedProdConfig)).to.be.true;
    winMock.pendo.initialize.resetHistory();

    expect(winMock.pendo.initialize.callCount).to.equal(0);
    pendoMiddleware(api, qa1WinMock)(getStateObj)(next)(loginSuccess);
    expect(winMock.pendo.initialize.callCount).to.equal(1);
    expect(winMock.pendo.initialize.getCall(0).args[0]).to.eql(expectedQA1Config);
    expect(winMock.pendo.initialize.calledWith(expectedQA1Config)).to.be.true;
  });

  it('should call update for SELECT_CLINIC_SUCCESS', () => {
    winMock.pendo.visitorId = 'clinicMemberID';
    const selectClinic = {
      type: ActionTypes.SELECT_CLINIC_SUCCESS,
      payload: {
        clinicId: 'clinicID987',
      },
    };
    getStateObj.getState.returns({
      ...emptyState,
      ...{
        blip: {
          clinics: _.pick(clinics, ['clinicID123', 'clinicID987']),
          loggedInUserId: 'clinicMemberID',
          allUsersMap: _.pick(users, 'clinicMemberID'),
          pendoData: {
            account: {},
            visitor: {},
          },
        },
      },
    });
    const expectedConfig = {
      account: {
        clinic: 'Other Mock Clinic',
        id: 'clinicID987',
        clinicianCount: null,
        country: 'CA',
        created: '2022-01-01T00:00:00.000Z',
        patientCount: undefined,
        tier: 'tier0100'
      },
      visitor: {
        id: 'clinicMemberID',
        currentlyViewedDevices: [],
        currentlyViewedDataAnnotations: [],
        permission: 'member',
      },
    };
    expect(winMock.pendo.updateOptions.callCount).to.equal(0);
    pendoMiddleware(api, winMock)(getStateObj)(next)(selectClinic);
    expect(winMock.pendo.updateOptions.callCount).to.equal(1);
    expect(winMock.pendo.updateOptions.getCall(0).args[0]).to.eql(expectedConfig);
    expect(winMock.pendo.updateOptions.calledWith(expectedConfig)).to.be.true;
  });

  it('should extend existing pendo data from state for SELECT_CLINIC_SUCCESS', () => {
    winMock.pendo.visitorId = 'clinicMemberID';
    const selectClinic = {
      type: ActionTypes.SELECT_CLINIC_SUCCESS,
      payload: {
        clinicId: 'clinicID987',
      },
    };
    getStateObj.getState.returns({
      ...emptyState,
      ...{
        blip: {
          clinics: _.pick(clinics, ['clinicID123', 'clinicID987']),
          loggedInUserId: 'clinicMemberID',
          allUsersMap: _.pick(users, 'clinicMemberID'),
          pendoData: {
            account: { existingAccountData: 'existingAccountData' },
            visitor: { existingVisitorData: 'existingVisitorData' },
          },
        },
      },
    });
    const expectedConfig = {
      account: {
        existingAccountData: 'existingAccountData',
        clinic: 'Other Mock Clinic',
        id: 'clinicID987',
        clinicianCount: null,
        country: 'CA',
        created: '2022-01-01T00:00:00.000Z',
        patientCount: undefined,
        tier: 'tier0100'
      },
      visitor: {
        existingVisitorData: 'existingVisitorData',
        id: 'clinicMemberID',
        currentlyViewedDevices: [],
        currentlyViewedDataAnnotations: [],
        permission: 'member',
      },
    };
    expect(winMock.pendo.updateOptions.callCount).to.equal(0);
    pendoMiddleware(api, winMock)(getStateObj)(next)(selectClinic);
    expect(winMock.pendo.updateOptions.callCount).to.equal(1);
    expect(winMock.pendo.updateOptions.getCall(0).args[0]).to.eql(expectedConfig);
    expect(winMock.pendo.updateOptions.calledWith(expectedConfig)).to.be.true;
  });

  it('should call update and clear properties for SELECT_CLINIC_SUCCESS with clinicID null', () => {
    winMock.pendo.visitorId = 'clinicMemberID';
    const selectClinic = {
      type: ActionTypes.SELECT_CLINIC_SUCCESS,
      payload: {
        clinicId: null,
      },
    };
    getStateObj.getState.returns({
      ...emptyState,
      ...{
        blip: {
          clinics: _.pick(clinics, ['clinicID123', 'clinicID987']),
          loggedInUserId: 'clinicAdminID',
          allUsersMap: _.pick(users, 'clinicAdminID'),
          pendoData: {
            account: {
              clinic: 'Other Mock Clinic',
              id: 'clinicID987',
              clinicianCount: null,
              country: 'CA',
              created: '2022-01-01T00:00:00.000Z',
              patientCount: undefined,
              tier: 'tier0100',
            },
            visitor: {
              id: 'clinicMemberID',
              currentlyViewedDevices: [],
              permission: 'member',
            },
          },
        },
      },
    });
    const expectedConfig = {
      account: {
        id: 'clinicAdminID',
        clinic: null,
        tier: null,
        created: null,
        country: null,
        patientCount: null,
        clinicianCount: null,
      },
      visitor: {
        id: 'clinicAdminID',
        currentlyViewedDevices: [],
        currentlyViewedDataAnnotations: [],
        permission: null,
      },
    };
    expect(winMock.pendo.updateOptions.callCount).to.equal(0);
    pendoMiddleware(api, winMock)(getStateObj)(next)(selectClinic);
    expect(winMock.pendo.updateOptions.callCount).to.equal(1);
    expect(winMock.pendo.updateOptions.args[0][0]).to.eql(expectedConfig);
  });

  it('should call update and set patient count for FETCH_CLINIC_PATIENT_COUNTS_SUCCESS', () => {
    winMock.pendo.visitorId = 'clinicAdminID';
    const fetchClinicPatientCountsSuccess = {
      type: ActionTypes.FETCH_CLINIC_PATIENT_COUNTS_SUCCESS,
      payload: {
        clinicId: 'clinicID123',
        patientCounts: {
          demo: 1,
          plan: 32,
          total: 33,
        },
      },
    };
    getStateObj.getState.returns({
      ...emptyState,
      ...{
        blip: {
          clinics: _.pick(clinics, 'clinicID123'),
          loggedInUserId: 'clinicAdminID',
          allUsersMap: _.pick(users, 'clinicAdminID'),
          selectedClinicId: 'clinicID123',
          pendoData: {
            account: {},
            visitor: {},
          },
        },
      },
    });
    const expectedConfig = {
      account: {
        id: 'clinicID123',
        patientCount: 32,
      },
      visitor: {},
    };
    expect(winMock.pendo.updateOptions.callCount).to.equal(0);
    pendoMiddleware(api, winMock)(getStateObj)(next)(fetchClinicPatientCountsSuccess);
    expect(winMock.pendo.updateOptions.callCount).to.equal(1);
    expect(winMock.pendo.updateOptions.args[0][0]).to.eql(expectedConfig);
  });

  it('should call update and set patient count limit and start date for FETCH_CLINIC_PATIENT_COUNT_SETTINGS_SUCCESS', () => {
    winMock.pendo.visitorId = 'clinicAdminID';
    const fetchClinicPatientCountSettingsSuccess = {
      type: ActionTypes.FETCH_CLINIC_PATIENT_COUNT_SETTINGS_SUCCESS,
      payload: {
        clinicId: 'clinicID123',
        patientCountSettings: {
          hardLimit: {
            plan: 250,
            startDate: '2024-11-11T00:00:00.000Z',
          },
        },
      },
    };
    getStateObj.getState.returns({
      ...emptyState,
      ...{
        blip: {
          clinics: _.pick(clinics, 'clinicID123'),
          loggedInUserId: 'clinicAdminID',
          allUsersMap: _.pick(users, 'clinicAdminID'),
          selectedClinicId: 'clinicID123',
          pendoData: {
            account: {},
            visitor: {},
          },
        },
      },
    });
    const expectedConfig = {
      account: {
        id: 'clinicID123',
        patientCountHardLimit: 250,
        patientCountHardLimitStartDate: '2024-11-11T00:00:00.000Z',
      },
      visitor: {},
    };
    expect(winMock.pendo.updateOptions.callCount).to.equal(0);
    pendoMiddleware(api, winMock)(getStateObj)(next)(fetchClinicPatientCountSettingsSuccess);
    expect(winMock.pendo.updateOptions.callCount).to.equal(1);
    expect(winMock.pendo.updateOptions.args[0][0]).to.eql(expectedConfig);
  });

  it('should call update and set patient count limit and start date for SET_CLINIC_UI_DETAILS', () => {
    winMock.pendo.visitorId = 'clinicAdminID';
    const setClinicUIDetails = {
      type: ActionTypes.SET_CLINIC_UI_DETAILS,
      payload: {
        clinicId: 'clinicID123',
        uiDetails: {
          patientLimitEnforced: false,
          planName: 'activeSalesBase',
        },
      },
    };
    getStateObj.getState.returns({
      ...emptyState,
      ...{
        blip: {
          clinics: _.pick(clinics, 'clinicID123'),
          loggedInUserId: 'clinicAdminID',
          allUsersMap: _.pick(users, 'clinicAdminID'),
          selectedClinicId: 'clinicID123',
          pendoData: {
            account: {},
            visitor: {},
          },
        },
      },
    });
    const expectedConfig = {
      account: {
        id: 'clinicID123',
        patientLimitEnforced: false,
        planName: 'activeSalesBase',
      },
      visitor: {},
    };
    expect(winMock.pendo.updateOptions.callCount).to.equal(0);
    pendoMiddleware(api, winMock)(getStateObj)(next)(setClinicUIDetails);
    expect(winMock.pendo.updateOptions.callCount).to.equal(1);
    expect(winMock.pendo.updateOptions.args[0][0]).to.eql(expectedConfig);
  });

  context('Legacy patient count APIs', () => {
    it('should call update and set patient count for FETCH_CLINIC_PATIENT_COUNTS_SUCCESS', () => {
      winMock.pendo.visitorId = 'clinicAdminID';
      const fetchClinicPatientCountsSuccess = {
        type: ActionTypes.FETCH_CLINIC_PATIENT_COUNTS_SUCCESS,
        payload: {
          clinicId: 'clinicID123',
          patientCounts: {
            patientCount: 32,
          },
        },
      };
      getStateObj.getState.returns({
        ...emptyState,
        ...{
          blip: {
            clinics: _.pick(clinics, 'clinicID123'),
            loggedInUserId: 'clinicAdminID',
            allUsersMap: _.pick(users, 'clinicAdminID'),
            selectedClinicId: 'clinicID123',
            pendoData: {
              account: {},
              visitor: {},
            },
          },
        },
      });
      const expectedConfig = {
        account: {
          id: 'clinicID123',
          patientCount: 32,
        },
        visitor: {},
      };
      expect(winMock.pendo.updateOptions.callCount).to.equal(0);
      pendoMiddleware(api, winMock)(getStateObj)(next)(fetchClinicPatientCountsSuccess);
      expect(winMock.pendo.updateOptions.callCount).to.equal(1);
      expect(winMock.pendo.updateOptions.args[0][0]).to.eql(expectedConfig);
    });

    it('should call update and set patient count limit and start date for FETCH_CLINIC_PATIENT_COUNT_SETTINGS_SUCCESS', () => {
      winMock.pendo.visitorId = 'clinicAdminID';
      const fetchClinicPatientCountSettingsSuccess = {
        type: ActionTypes.FETCH_CLINIC_PATIENT_COUNT_SETTINGS_SUCCESS,
        payload: {
          clinicId: 'clinicID123',
          patientCountSettings: {
            hardLimit: {
              patientCount: 250,
              startDate: '2024-11-11T00:00:00.000Z',
            },
          },
        },
      };
      getStateObj.getState.returns({
        ...emptyState,
        ...{
          blip: {
            clinics: _.pick(clinics, 'clinicID123'),
            loggedInUserId: 'clinicAdminID',
            allUsersMap: _.pick(users, 'clinicAdminID'),
            selectedClinicId: 'clinicID123',
            pendoData: {
              account: {},
              visitor: {},
            },
          },
        },
      });
      const expectedConfig = {
        account: {
          id: 'clinicID123',
          patientCountHardLimit: 250,
          patientCountHardLimitStartDate: '2024-11-11T00:00:00.000Z',
        },
        visitor: {},
      };
      expect(winMock.pendo.updateOptions.callCount).to.equal(0);
      pendoMiddleware(api, winMock)(getStateObj)(next)(fetchClinicPatientCountSettingsSuccess);
      expect(winMock.pendo.updateOptions.callCount).to.equal(1);
      expect(winMock.pendo.updateOptions.args[0][0]).to.eql(expectedConfig);
    });
  });

  it('should call update and set clinician count for FETCH_CLINICIANS_FROM_CLINIC_SUCCESS', () => {
    winMock.pendo.visitorId = 'clinicAdminID';
    const fetchCliniciansFromClinicSuccess = {
      type: ActionTypes.FETCH_CLINICIANS_FROM_CLINIC_SUCCESS,
      payload: {
        results: {
          clinicId: 'clinicID123',
          clinicians: new Array(13),
        },
      },
    };
    getStateObj.getState.returns({
      ...emptyState,
      ...{
        blip: {
          clinics: _.pick(clinics, 'clinicID123'),
          loggedInUserId: 'clinicAdminID',
          allUsersMap: _.pick(users, 'clinicAdminID'),
          selectedClinicId: 'clinicID123',
          pendoData: {
            account: {},
            visitor: {},
          },
        },
      },
    });
    const expectedConfig = {
      account: {
        id: 'clinicID123',
        clinicianCount: 13,
      },
      visitor: {},
    };
    expect(winMock.pendo.updateOptions.callCount).to.equal(0);
    pendoMiddleware(api, winMock)(getStateObj)(next)(fetchCliniciansFromClinicSuccess);
    expect(winMock.pendo.updateOptions.callCount).to.equal(1);
    expect(winMock.pendo.updateOptions.args[0][0]).to.eql(expectedConfig);
  });

  it('should call update and set last upload date for DATA_WORKER_ADD_DATA_SUCCESS if patient is logged-in user', () => {
    winMock.pendo.visitorId = 'patientId';
    const dataWorkerAddDataSuccess = {
      type: ActionTypes.DATA_WORKER_ADD_DATA_SUCCESS,
      payload: {
        result: {
          metaData: {
            patientId: 'patientId',
            latestDatumByType: {
              upload: { _deviceTime: 'some upload time' },
            },
          },
        },
      },
    };
    getStateObj.getState.returns({
      ...emptyState,
      ...{
        blip: {
          loggedInUserId: 'patientId',
          allUsersMap: _.pick(users, 'patientId'),
          pendoData: {
            account: {},
            visitor: {},
          },
        },
      },
    });
    const expectedConfig = {
      account: {},
      visitor: {
        id: 'patientId',
        lastUpload: 'some upload time',
      },
    };
    expect(winMock.pendo.updateOptions.callCount).to.equal(0);
    pendoMiddleware(api, winMock)(getStateObj)(next)(dataWorkerAddDataSuccess);
    expect(winMock.pendo.updateOptions.callCount).to.equal(1);
    expect(winMock.pendo.updateOptions.args[0][0]).to.eql(expectedConfig);
  });

  it('should not set last upload date for DATA_WORKER_ADD_DATA_SUCCESS if patient is not logged-in user', () => {
    winMock.pendo.visitorId = 'clinicMemberID';
    const dataWorkerAddDataSuccess = {
      type: ActionTypes.DATA_WORKER_ADD_DATA_SUCCESS,
      payload: {
        result: {
          metaData: {
            patientId: 'patientId',
            latestDatumByType: {
              upload: { _deviceTime: 'some upload time' },
            },
          },
        },
      },
    };
    getStateObj.getState.returns({
      ...emptyState,
      ...{
        blip: {
          loggedInUserId: 'clinicMemberID', // patient is not the logged-in user
          allUsersMap: _.pick(users, 'patientId'),
          pendoData: {
            account: {},
            visitor: {},
          },
        },
      },
    });
    expect(winMock.pendo.updateOptions.callCount).to.equal(0);
    pendoMiddleware(api, winMock)(getStateObj)(next)(dataWorkerAddDataSuccess);
    expect(winMock.pendo.updateOptions.callCount).to.equal(0);
  });

  it('should update Pendo correctly on DATA_WORKER_QUERY_DATA_SUCCESS', () => {
    winMock.pendo.visitorId = 'clinicAdminID';
    const dataWorkerQueryDataSuccess = {
      type: ActionTypes.DATA_WORKER_QUERY_DATA_SUCCESS,
      payload: {
        result: {
          metaData: {
            matchedDevices: {
              deviceType1: { device1: true, device2: true },
              deviceType2: { device3: true },
              deviceType3: { 'device3_1.0.1-rc.1+10034': true },
            },
            dataAnnotations: {
              annotation1: { code: 'annotation1' },
              annotation2: { code: 'annotation2' },
              annotation3: { code: 'annotation3' },
            }
          },
        },
      },
    };

    getStateObj.getState.returns({
      ...emptyState,
      ...{
        blip: {
          loggedInUserId: 'clinicAdminID',
          currentPatientInViewId: 'patient123',
          allUsersMap: _.pick(users, 'clinicAdminID'),
          pendoData: {
            account: {
              clinic: 'Mock Clinic Name',
              id: 'clinicID123',
            },
            visitor: {
              id: 'clinicAdminID',
              currentlyViewedDevices: [],
              currentlyViewedDataAnnotations: [],
            },
          },
        },
      },
    });

    const expectedConfig = {
      account: {
        clinic: 'Mock Clinic Name',
        id: 'clinicID123',
      },
      visitor: {
        id: 'clinicAdminID',
        currentlyViewedDevices: ['device1', 'device2', 'device3', 'device3_1', 'device3_1.0', 'device3_1.0.1'],
        currentlyViewedDataAnnotations: ['annotation1', 'annotation2', 'annotation3'],
      },
    };

    expect(winMock.pendo.updateOptions.callCount).to.equal(0);
    pendoMiddleware(api, winMock)(getStateObj)(next)(dataWorkerQueryDataSuccess);
    expect(winMock.pendo.updateOptions.callCount).to.equal(1);
    expect(winMock.pendo.updateOptions.getCall(0).args[0]).to.eql(expectedConfig);
    expect(winMock.pendo.updateOptions.calledWith(expectedConfig)).to.be.true;
  });

  it('should update Pendo correctly on LOGOUT_REQUEST', () => {
    winMock.pendo.visitorId = 'clinicAdminID';
    const logoutRequest = {
      type: ActionTypes.LOGOUT_REQUEST,
    };

    getStateObj.getState.returns({
      ...emptyState,
      ...{
        blip: {
          loggedInUserId: 'clinicAdminID',
          allUsersMap: _.pick(users, 'clinicAdminID'),
          pendoData: {
            account: {
              clinic: 'Mock Clinic Name',
              id: 'clinicID123',
            },
            visitor: {
              id: 'clinicAdminID',
              currentlyViewedDevices: ['Device1', 'Device2'],
              currentlyViewedDataAnnotations: [],
            },
          },
        },
      },
    });

    const expectedConfig = {
      account: {
        clinic: 'Mock Clinic Name',
        id: 'clinicID123',
      },
      visitor: {
        id: 'clinicAdminID',
        currentlyViewedDevices: [],
        currentlyViewedDataAnnotations: [],
      },
    };

    expect(winMock.pendo.updateOptions.callCount).to.equal(0);
    pendoMiddleware(api, winMock)(getStateObj)(next)(logoutRequest);
    expect(winMock.pendo.updateOptions.callCount).to.equal(1);
    expect(winMock.pendo.updateOptions.getCall(0).args[0]).to.eql(expectedConfig);
    expect(winMock.pendo.updateOptions.calledWith(expectedConfig)).to.be.true;
  });

  it('should update Pendo correctly on DATA_WORKER_REMOVE_DATA_SUCCESS', () => {
    winMock.pendo.visitorId = 'clinicAdminID';
    const dataWorkerRemoveDataSuccess = {
      type: ActionTypes.DATA_WORKER_REMOVE_DATA_SUCCESS,
    };

    getStateObj.getState.returns({
      ...emptyState,
      ...{
        blip: {
          loggedInUserId: 'clinicAdminID',
          allUsersMap: _.pick(users, 'clinicAdminID'),
          pendoData: {
            account: {
              clinic: 'Mock Clinic Name',
              id: 'clinicID123',
            },
            visitor: {
              id: 'clinicAdminID',
              currentlyViewedDevices: ['Device1', 'Device2'],
              currentlyViewedDataAnnotations: [],
            },
          },
        },
      },
    });

    const expectedConfig = {
      account: {
        clinic: 'Mock Clinic Name',
        id: 'clinicID123',
      },
      visitor: {
        id: 'clinicAdminID',
        currentlyViewedDevices: [],
        currentlyViewedDataAnnotations: [],
      },
    };

    expect(winMock.pendo.updateOptions.callCount).to.equal(0);
    pendoMiddleware(api, winMock)(getStateObj)(next)(dataWorkerRemoveDataSuccess);
    expect(winMock.pendo.updateOptions.callCount).to.equal(1);
    expect(winMock.pendo.updateOptions.getCall(0).args[0]).to.eql(expectedConfig);
    expect(winMock.pendo.updateOptions.calledWith(expectedConfig)).to.be.true;
  });
});

describe('parseDeviceKeyVersions', () => {
  it('should parse device key with full semver and build metadata', () => {
    const key = 'com.dekaresearch.twiist_1.0.0+1.11-14.16';
    const result = parseDeviceKeyVersions(key);

    expect(result).to.have.lengthOf(3);
    expect(result).to.include('com.dekaresearch.twiist_1.0.0');
    expect(result).to.include('com.dekaresearch.twiist_1.0');
    expect(result).to.include('com.dekaresearch.twiist_1');
  });

  it('should parse device key with only major.minor.patch', () => {
    const key = 'com.dexcom.g6_2.1.3';
    const result = parseDeviceKeyVersions(key);

    expect(result).to.have.lengthOf(3);
    expect(result).to.include('com.dexcom.g6_2.1.3');
    expect(result).to.include('com.dexcom.g6_2.1');
    expect(result).to.include('com.dexcom.g6_2');
  });

  it('should parse device key with only major.minor', () => {
    const key = 'com.example.device_1.5';
    const result = parseDeviceKeyVersions(key);

    expect(result).to.have.lengthOf(2);
    expect(result).to.include('com.example.device_1.5');
    expect(result).to.include('com.example.device_1');
  });

  it('should parse device key with only major version', () => {
    const key = 'com.example.device_2';
    const result = parseDeviceKeyVersions(key);

    expect(result).to.have.lengthOf(1);
    expect(result).to.include('com.example.device_2');
  });

  it('should handle device origin with multiple underscores', () => {
    const key = 'com.company.device_name_with_underscores_1.2.3';
    const result = parseDeviceKeyVersions(key);

    expect(result).to.have.lengthOf(3);
    expect(result).to.include('com.company.device_name_with_underscores_1.2.3');
    expect(result).to.include('com.company.device_name_with_underscores_1.2');
    expect(result).to.include('com.company.device_name_with_underscores_1');
  });

  it('should handle version with pre-release identifier', () => {
    const key = 'com.example.device_1.0.0-beta.1';
    const result = parseDeviceKeyVersions(key);

    expect(result).to.have.lengthOf(3);
    expect(result).to.include('com.example.device_1.0.0');
    expect(result).to.include('com.example.device_1.0');
    expect(result).to.include('com.example.device_1');
  });

  it('should handle empty keys or keys without semver gracefully', () => {
    expect(parseDeviceKeyVersions('')).to.deep.equal([]);
    expect(parseDeviceKeyVersions('no_underscore')).to.deep.equal(['no_underscore']);
    expect(parseDeviceKeyVersions('device_')).to.deep.equal(['device_']);
  });
});
