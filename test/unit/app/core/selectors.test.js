import { expect } from 'chai';
import { selectPatientSharedAccounts } from '../../../../app/core/selectors';

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
