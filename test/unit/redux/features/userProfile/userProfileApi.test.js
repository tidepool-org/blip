/* global chai */
/* global Promise */
/* global describe */
/* global it */
/* global beforeEach */
/* global afterEach */

import * as ErrorMessages from '../../../../../app/redux/constants/errorMessages';

// Capture the endpoint config that userProfileApi passes to injectEndpoints at load time.
// The factory runs synchronously when the module is first required, so anything
// imported below will see the fully-populated capturedEndpoints object.
jest.mock('../../../../../app/redux/api/baseApi', () => {
  const capturedEndpoints = {};
  return {
    RTKQueryApi: {
      injectEndpoints: ({ endpoints }) => {
        const builder = {
          mutation: (config) => {
            capturedEndpoints.updateUserProfile = config;
            return config;
          },
        };
        endpoints(builder);
        return { useUpdateUserProfileMutation: jest.fn() };
      },
    },
    _capturedEndpoints: capturedEndpoints,
  };
});

jest.mock('../../../../../app/core/api', () => ({
  __esModule: true,
  default: {
    user: {
      put: jest.fn(),
    },
  },
}));

jest.mock('../../../../../app/redux/actions/sync', () => ({
  updateUserSuccess: jest.fn(),
}));

import * as baseApi from '../../../../../app/redux/api/baseApi';
import tidepoolApi from '../../../../../app/core/api';
import * as sync from '../../../../../app/redux/actions/sync';

// This import triggers RTKQueryApi.injectEndpoints, populating capturedEndpoints.
import '../../../../../app/redux/features/userProfile/userProfileApi';

const expect = chai.expect;

describe('userProfileApi', () => {
  let currentUser;
  let getState;

  beforeEach(() => {
    currentUser = {
      userid: 'user1',
      username: 'joe@example.com',
      emails: ['joe@example.com'],
      profile: { fullName: 'Joe Bloggs', age: 29 },
      preferences: { foo: 'bar' },
    };
    getState = () => ({
      blip: {
        loggedInUserId: 'user1',
        allUsersMap: { user1: currentUser },
      },
    });
  });

  afterEach(() => {
    tidepoolApi.user.put.mockReset();
    sync.updateUserSuccess.mockReset();
  });

  describe('updateUserProfile endpoint', () => {
    describe('queryFn', () => {
      let queryFn;

      beforeEach(() => {
        queryFn = baseApi._capturedEndpoints.updateUserProfile.queryFn;
      });

      describe('profile merging', () => {
        it('deep-merges formValues.profile over the existing profile', async () => {
          tidepoolApi.user.put.mockImplementation((u, cb) => cb(null, u));

          await queryFn({ profile: { age: 30 } }, { getState });

          const [sent] = tidepoolApi.user.put.mock.calls[0];
          expect(sent.profile).to.deep.equal({ fullName: 'Joe Bloggs', age: 30 });
        });

        it('deep-merges formValues.preferences over existing preferences', async () => {
          tidepoolApi.user.put.mockImplementation((u, cb) => cb(null, u));

          await queryFn({ preferences: { baz: 'qux' } }, { getState });

          const [sent] = tidepoolApi.user.put.mock.calls[0];
          expect(sent.preferences).to.deep.equal({ foo: 'bar', baz: 'qux' });
        });

        it('omits username and emails from the API call when username is unchanged', async () => {
          tidepoolApi.user.put.mockImplementation((u, cb) => cb(null, u));

          await queryFn({ username: 'joe@example.com', profile: {} }, { getState });

          const [sent] = tidepoolApi.user.put.mock.calls[0];
          expect(sent).to.not.have.property('username');
          expect(sent).to.not.have.property('emails');
        });

        it('includes username and emails when username has changed', async () => {
          tidepoolApi.user.put.mockImplementation((u, cb) => cb(null, u));

          await queryFn({ username: 'newjoe@example.com', profile: {} }, { getState });

          const [sent] = tidepoolApi.user.put.mock.calls[0];
          expect(sent.username).to.equal('newjoe@example.com');
          expect(sent.emails).to.deep.equal(['joe@example.com']);
        });
      });

      describe('on success', () => {
        it('returns { data: updatedUser }', async () => {
          const updatedUser = { ...currentUser, profile: { fullName: 'Joe Updated' } };
          tidepoolApi.user.put.mockImplementation((u, cb) => cb(null, updatedUser));

          const result = await queryFn({ profile: { fullName: 'Joe Updated' } }, { getState });

          expect(result).to.deep.equal({ data: updatedUser });
        });
      });

      describe('on error', () => {
        it('returns ERR_UPDATING_USER_EMAIL_IN_USE for a 409 conflict', async () => {
          tidepoolApi.user.put.mockImplementation((u, cb) => cb({ status: 409 }));

          const result = await queryFn({ profile: {} }, { getState });

          expect(result.error.status).to.equal(409);
          expect(result.error.data).to.equal(ErrorMessages.ERR_UPDATING_USER_EMAIL_IN_USE);
        });

        it('returns ERR_UPDATING_USER for non-409 errors', async () => {
          tidepoolApi.user.put.mockImplementation((u, cb) => cb({ status: 500 }));

          const result = await queryFn({ profile: {} }, { getState });

          expect(result.error.status).to.equal(500);
          expect(result.error.data).to.equal(ErrorMessages.ERR_UPDATING_USER);
        });

        it('uses CUSTOM_ERROR status when the error carries no status code', async () => {
          tidepoolApi.user.put.mockImplementation((u, cb) => cb({}));

          const result = await queryFn({ profile: {} }, { getState });

          expect(result.error.status).to.equal('CUSTOM_ERROR');
          expect(result.error.data).to.equal(ErrorMessages.ERR_UPDATING_USER);
        });
      });
    });

    describe('onQueryStarted', () => {
      let onQueryStarted;
      let dispatch;

      beforeEach(() => {
        onQueryStarted = baseApi._capturedEndpoints.updateUserProfile.onQueryStarted;
        dispatch = jest.fn();
        sync.updateUserSuccess.mockReturnValue({ type: 'UPDATE_USER_SUCCESS' });
      });

      it('dispatches updateUserSuccess with loggedInUserId and updatedUser on fulfillment', async () => {
        const updatedUser = { userid: 'user1', profile: { fullName: 'Joe Updated' } };
        const queryFulfilled = Promise.resolve({ data: updatedUser });

        await onQueryStarted(undefined, { dispatch, getState, queryFulfilled });

        expect(sync.updateUserSuccess.mock.calls).to.have.lengthOf(1);
        expect(sync.updateUserSuccess.mock.calls[0]).to.deep.equal(['user1', updatedUser]);
        expect(dispatch.mock.calls).to.have.lengthOf(1);
      });

      it('silently swallows queryFulfilled rejection without throwing', async () => {
        const queryFulfilled = Promise.reject(new Error('API failed'));

        await onQueryStarted(undefined, { dispatch, getState, queryFulfilled });

        expect(sync.updateUserSuccess.mock.calls).to.have.lengthOf(0);
        expect(dispatch.mock.calls).to.have.lengthOf(0);
      });
    });
  });
});
