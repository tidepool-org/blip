/* global sinon */
/* global describe */
/* global it */
/* global expect */
/* global context */
/* global beforeEach */

import * as ActionTypes from '../../../../app/redux/constants/actionTypes';
import launchDarklyMiddleware, { ldContext } from '../../../../app/redux/utils/launchDarklyMiddleware';

describe('launchDarklyMiddleware', () => {
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

  const patientState = {
    ...emptyState,
    ...{
      blip: {
        clinics: {
          clinicID123: {
            id: 'clinicID123',
            clinicians: {},
            name: 'Mock Clinic Name',
            tier: 'tier0300',
          },
        },
        loggedInUserId: 'userID345',
        allUsersMap: {
          userID345: { userid: 'userID345', roles: [] },
        },
      },
    },
  };

  const clinicMemberState = {
    ...emptyState,
    ...{
      blip: {
        clinics: {
          clinicID123: {
            id: 'clinicID123',
            clinicians: { userID345: { roles: [] } },
            name: 'Mock Clinic Name',
            tier: 'tier0300',
          },
        },
        loggedInUserId: 'userID345',
        allUsersMap: {
          userID345: { userid: 'userID345', roles: ['clinician'] },
        },
      },
    },
  };

  const clinicMemberMultipleState = {
    ...emptyState,
    ...{
      blip: {
        clinics: {
          clinicID123: {
            id: 'clinicID123',
            clinicians: { userID345: { roles: [] } },
            name: 'Mock Clinic Name',
            tier: 'tier0300',
          },
          clinicID456: {
            id: 'clinicID456',
            clinicians: { userID345: { roles: [] } },
            name: 'Mock Clinic Name',
            tier: 'tier0300',
          },
        },
        loggedInUserId: 'userID345',
        allUsersMap: {
          userID345: { userid: 'userID345', roles: ['clinician'] },
        },
      },
    },
  };

  const clinicAdminState = {
    ...emptyState,
    ...{
      blip: {
        clinics: {
          clinicID123: {
            id: 'clinicID123',
            clinicians: { userID345: { roles: ['CLINIC_ADMIN'] } },
            name: 'Mock Clinic Name',
            tier: 'tier0300',
          },
        },
        loggedInUserId: 'userID345',
        allUsersMap: {
          userID345: { userid: 'userID345', roles: ['clinician'] },
        },
      },
    },
  };

  const getStateObj = {
    getState: sinon.stub().returns(emptyState),
  };
  const next = sinon.stub();

  const defaultClinicContext = { key: 'none' };
  const defaultUserContext = { key: 'anon' };

  const defaultContext = {
    kind: 'multi',
    clinic: defaultClinicContext,
    user: defaultUserContext,
  };

  beforeEach(() => {
    getStateObj.getState.returns(emptyState);
    ldContext.clinic = { ...defaultClinicContext };
    ldContext.user = { ...defaultUserContext };
  });

  context('LOGIN_SUCCESS', () => {
    it('should set full user context to default for LOGIN_SUCCESS for clinician user', () => {
      const action = {
        type: ActionTypes.LOGIN_SUCCESS,
      };

      getStateObj.getState.returns(clinicMemberState)

      expect(ldContext).to.eql(defaultContext);
      launchDarklyMiddleware()(getStateObj)(next)(action);

      expect(ldContext.user).to.eql({
       application: 'Web',
       key: 'userID345',
       permission: 'member',
       role: 'clinician',
      });
    });

    it('should set partial user context to default for LOGIN_SUCCESS for a non-clinician user', () => {
      const action = {
        type: ActionTypes.LOGIN_SUCCESS,
      };

      getStateObj.getState.returns(patientState)

      expect(ldContext).to.eql(defaultContext);
      launchDarklyMiddleware()(getStateObj)(next)(action);

      expect(ldContext.user).to.eql({
       application: 'Web',
       key: 'anon',
       role: 'personal',
      });
    });

    it('should set clinic context if user is member of only one clinic', () => {
      const action = {
        type: ActionTypes.LOGIN_SUCCESS,
      };

      getStateObj.getState.returns(clinicMemberState)

      expect(ldContext).to.eql(defaultContext);
      launchDarklyMiddleware()(getStateObj)(next)(action);
      expect(ldContext.clinic).to.eql({
        application: 'Web',
        key: 'clinicID123',
        name: 'Mock Clinic Name',
        tier: 'tier0300',
      });
    });

    it('should not set clinic context if user is member of more than one clinic', () => {
      const action = {
        type: ActionTypes.LOGIN_SUCCESS,
      };

      getStateObj.getState.returns(clinicMemberMultipleState)

      expect(ldContext).to.eql(defaultContext);
      launchDarklyMiddleware()(getStateObj)(next)(action);
      expect(ldContext.clinic).to.eql(defaultClinicContext);
    });
  });

  context('SELECT_CLINIC', () => {
    it('should set clinic context to the selected clinic', () => {
      const action = {
        type: ActionTypes.SELECT_CLINIC,
        payload: {
          clinicId: 'clinicID123',
        },
      };

      getStateObj.getState.returns(clinicMemberState)

      expect(ldContext).to.eql(defaultContext);
      launchDarklyMiddleware()(getStateObj)(next)(action);
      expect(ldContext.clinic).to.eql({
        application: 'Web',
        key: 'clinicID123',
        name: 'Mock Clinic Name',
        tier: 'tier0300',
      });
    });

    it('should set user permission context to `administrator` for admins', () => {
      const action = {
        type: ActionTypes.SELECT_CLINIC,
        payload: {
          clinicId: 'clinicID123',
        },
      };

      getStateObj.getState.returns(clinicAdminState)

      expect(ldContext).to.eql(defaultContext);
      launchDarklyMiddleware()(getStateObj)(next)(action);
      expect(ldContext.user).to.eql({
        ...defaultUserContext,
        permission: 'administrator',
      });
    });

    it('should set user permission context to `member` for non-admins', () => {
      const action = {
        type: ActionTypes.SELECT_CLINIC,
        payload: {
          clinicId: 'clinicID123',
        },
      };

      getStateObj.getState.returns(clinicMemberState)

      expect(ldContext).to.eql(defaultContext);
      launchDarklyMiddleware()(getStateObj)(next)(action);
      expect(ldContext.user).to.eql({
        ...defaultUserContext,
        permission: 'member',
      });
    });

    it('should reset clinic context to default for SELECT_CLINIC with clinicID null', () => {
      const action = {
        type: ActionTypes.SELECT_CLINIC,
        payload: {
          clinicId: null,
        },
      };

      ldContext.clinic = { key: 'clinic123' };
      expect(ldContext).to.eql({ ...defaultContext, clinic: { key: 'clinic123' } });
      launchDarklyMiddleware()(getStateObj)(next)(action);
      expect(ldContext).to.eql(defaultContext);
    });
  });

  context('LOGOUT_SUCCESS', () => {
    it('should reset clinic and user context to default for LOGOUT_SUCCESS', () => {
      const action = {
        type: ActionTypes.LOGOUT_SUCCESS,
      };

      ldContext.clinic = { key: 'clinic123' };
      ldContext.user = { key: 'clinician123' };

      expect(ldContext).to.eql({
        kind: 'multi',
        clinic: { key: 'clinic123' },
        user: { key: 'clinician123' },
      });

      launchDarklyMiddleware()(getStateObj)(next)(action);
      expect(ldContext).to.eql(defaultContext);
    });
  });
});
