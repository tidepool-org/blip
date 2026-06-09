import { expect } from 'chai';
import { selectPatientSharedAccounts, selectMfaStatus } from '../../../../app/core/selectors';

/* global describe */
/* global it */

describe('selectPatientSharedAccounts', () => {
  it('should return an empty array if state is empty', () => {
    const state = { blip: {} };
    const result = selectPatientSharedAccounts(state);
    expect(result).to.be.an('array').that.is.empty;
  });

  it('should return clinic accounts if clinics exist for the loggedInUserId', () => {
    const state = {
      blip: {
        allUsersMap: {},
        clinics: {
          clinicA: {
            id: 'clinicA',
            name: 'Test Clinic',
            patients: {
              user1: { permissions: { upload: true } },
            },
          },
        },
        loggedInUserId: 'user1',
        membersOfTargetCareTeam: [],
        pendingSentInvites: [],
        permissionsOfMembersInTargetCareTeam: {},
      },
    };
    const result = selectPatientSharedAccounts(state);
    expect(result).to.have.lengthOf(1);
    expect(result[0]).to.include({
      id: 'clinicA',
      name: 'Test Clinic',
      role: 'clinic',
      type: 'clinic',
      uploadPermission: true,
    });
  });

  it('should return user accounts labeled as "clinician" if user has a clinic role', () => {
    const state = {
      blip: {
        allUsersMap: {
          user2: {
            userid: 'user2',
            emails: ['test@example.com'],
            profile: { fullName: 'Test User' },
            roles: ['clinic'], // user has clinic role
          },
        },
        clinics: {},
        loggedInUserId: 'user1',
        membersOfTargetCareTeam: ['user2'],
        pendingSentInvites: [],
        permissionsOfMembersInTargetCareTeam: {
          user2: { view: true, upload: false },
        },
      },
    };
    const result = selectPatientSharedAccounts(state);
    expect(result).to.have.lengthOf(1);
    expect(result[0]).to.include({
      email: 'test@example.com',
      role: 'clinician',
    });
    expect(result[0].permissions).to.deep.equal({ view: true, upload: false });
  });

  it('should return user accounts labeled as "member" if user does not have a clinic role', () => {
    const state = {
      blip: {
        allUsersMap: {
          user3: {
            userid: 'user3',
            emails: ['another@example.com'],
            profile: { fullName: 'Another User' },
            roles: [], // user has no clinic role
          },
        },
        clinics: {},
        loggedInUserId: 'user1',
        membersOfTargetCareTeam: ['user3'],
        pendingSentInvites: [],
        permissionsOfMembersInTargetCareTeam: {
          user3: { view: true, upload: false },
        },
      },
    };
    const result = selectPatientSharedAccounts(state);
    expect(result).to.have.lengthOf(1);
    expect(result[0]).to.include({
      email: 'another@example.com',
      role: 'member',
    });
    expect(result[0].permissions).to.deep.equal({ view: true, upload: false });
  });

  it('should return pending invites as "member" by default', () => {
    const state = {
      blip: {
        allUsersMap: {},
        clinics: {},
        loggedInUserId: 'user1',
        membersOfTargetCareTeam: [],
        pendingSentInvites: [
          { email: 'invite@example.com', status: 'pending', key: 'abc123' },
        ],
        permissionsOfMembersInTargetCareTeam: {},
      },
    };
    const result = selectPatientSharedAccounts(state);
    expect(result).to.have.lengthOf(1);
    expect(result[0]).to.include({
      email: 'invite@example.com',
      role: 'member',
      status: 'pending',
      key: 'abc123',
    });
  });

  it('should return clinic invites with correct clinic name', () => {
    const state = {
      blip: {
        allUsersMap: {},
        clinics: {
          clinicB: { id: 'clinicB', name: 'Invited Clinic' },
        },
        loggedInUserId: 'user1',
        membersOfTargetCareTeam: [],
        pendingSentInvites: [
          {
            clinicId: 'clinicB',
            status: 'pending',
            key: 'xyz789',
            context: { upload: false },
            type: 'clinic',
          },
        ],
        permissionsOfMembersInTargetCareTeam: {},
      },
    };
    const result = selectPatientSharedAccounts(state);
    expect(result).to.have.lengthOf(1);
    expect(result[0]).to.include({
      id: 'clinicB',
      name: 'Invited Clinic',
      type: 'clinic',
      role: 'clinic',
      status: 'pending',
      key: 'xyz789',
      uploadPermission: false,
    });
  });
});

describe('selectMfaStatus', () => {
  const baselineShape = {
    enabled: false,
    enabledTime: null,
    device: { name: null, registeredTime: null },
    recoveryCodes: { used: null, total: null, generatedTime: null },
  };

  const stateWithMfa = (mfa) => ({
    blip: {
      loggedInUserId: 'user1',
      allUsersMap: {
        user1: {
          userid: 'user1',
          profile: { clinic: { mfa } },
        },
      },
    },
  });

  it('should return the disabled-baseline shape for an empty blip state', () => {
    const result = selectMfaStatus({ blip: {} });
    expect(result).to.deep.equal(baselineShape);
  });

  it('should return the disabled-baseline shape when the logged-in user has no mfa data', () => {
    const result = selectMfaStatus({
      blip: {
        loggedInUserId: 'user1',
        allUsersMap: { user1: { roles: ['clinician'] } },
      },
    });
    expect(result).to.deep.equal(baselineShape);
  });

  it('should default enabled to false and timestamps to null when source is missing', () => {
    const result = selectMfaStatus({ blip: {} });
    expect(result.enabled).to.be.false;
    expect(result.enabledTime).to.be.null;
    expect(result.device.name).to.be.null;
    expect(result.device.registeredTime).to.be.null;
    expect(result.recoveryCodes.generatedTime).to.be.null;
  });

  it('should report recoveryCodes.total and used as null when source is missing', () => {
    const result = selectMfaStatus({ blip: {} });
    expect(result.recoveryCodes.total).to.be.null;
    expect(result.recoveryCodes.used).to.be.null;
  });

  it('should read mfa values from allUsersMap[loggedInUserId].profile.clinic.mfa when populated', () => {
    const mfa = {
      enabled: true,
      enabledTime: '2026-04-01T00:00:00Z',
      device: { name: 'iPhone 17', registeredTime: '2026-04-01T00:00:00Z' },
      recoveryCodes: { used: 3, total: 12, generatedTime: '2026-04-01T00:00:00Z' },
    };
    const result = selectMfaStatus(stateWithMfa(mfa));
    expect(result).to.deep.equal(mfa);
  });

  it('should normalize partial mfa data, filling in missing fields with the disabled baseline', () => {
    const result = selectMfaStatus(stateWithMfa({
      enabled: true,
      device: { name: 'Pixel 12' },
      recoveryCodes: { used: 1 },
    }));
    expect(result).to.deep.equal({
      enabled: true,
      enabledTime: null,
      device: { name: 'Pixel 12', registeredTime: null },
      recoveryCodes: { used: 1, total: null, generatedTime: null },
    });
  });

  it('should coerce truthy non-boolean enabled values to a boolean', () => {
    const result = selectMfaStatus(stateWithMfa({ enabled: 'yes' }));
    expect(result.enabled).to.be.true;
  });

  it('should fall back to the baseline when loggedInUserId is absent even if allUsersMap is populated', () => {
    const result = selectMfaStatus({
      blip: {
        loggedInUserId: undefined,
        allUsersMap: {
          user1: { profile: { clinic: { mfa: { enabled: true } } } },
        },
      },
    });
    expect(result).to.deep.equal(baselineShape);
  });
});
