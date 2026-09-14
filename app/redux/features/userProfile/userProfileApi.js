/* global Promise */
import { assign, cloneDeep, omit } from 'lodash';
import { RTKQueryApi } from '../../api/baseApi';
import tidepoolApi from '../../../core/api';
import * as sync from '../../actions/sync';
import * as ErrorMessages from '../../constants/errorMessages';

const userProfileApi = RTKQueryApi.injectEndpoints({
  endpoints: (builder) => ({
    updateUserProfile: builder.mutation({
      queryFn: async (formValues, { getState }) => {
        const { blip: { loggedInUserId, allUsersMap } } = getState();
        const loggedInUser = allUsersMap[loggedInUserId];

        const newUser = assign(
          {},
          omit(loggedInUser, ['profile', 'preferences']),
          omit(formValues, ['profile', 'preferences']),
          {
            profile: assign({}, loggedInUser.profile, formValues.profile),
            preferences: assign({}, loggedInUser.preferences, formValues.preferences),
          }
        );

        let userUpdates = cloneDeep(newUser);
        if (userUpdates.username === loggedInUser.username) {
          userUpdates = omit(userUpdates, 'username', 'emails');
        }

        try {
          const updatedUser = await new Promise((resolve, reject) => {
            tidepoolApi.user.put(userUpdates, (err, user) => {
              if (err) reject(err);
              else resolve(user);
            });
          });
          return { data: updatedUser };
        } catch (err) {
          const message = err?.status === 409
            ? ErrorMessages.ERR_UPDATING_USER_EMAIL_IN_USE
            : ErrorMessages.ERR_UPDATING_USER;
          return { error: { status: err?.status ?? 'CUSTOM_ERROR', data: message } };
        }
      },
      async onQueryStarted(_, { dispatch, getState, queryFulfilled }) {
        try {
          const { data: updatedUser } = await queryFulfilled;
          const { blip: { loggedInUserId } } = getState();
          dispatch(sync.updateUserSuccess(loggedInUserId, updatedUser));
        } catch {}
      },
    }),
  }),
});

export const { useUpdateUserProfileMutation } = userProfileApi;
