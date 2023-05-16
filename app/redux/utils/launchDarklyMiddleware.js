import filter from 'lodash/filter';
import includes from 'lodash/includes';
import indexOf from 'lodash/indexOf';
import isEmpty from 'lodash/isEmpty';
import isNull from 'lodash/isNull';
import * as LDClient from 'launchdarkly-js-client-sdk';

import * as ActionTypes from '../constants/actionTypes';

/* global __LAUNCHDARKLY_CLIENT_TOKEN__ */

const trackingActions = [ActionTypes.LOGIN_SUCCESS, ActionTypes.SELECT_CLINIC, ActionTypes.LOGOUT_SUCCESS];

const defaultUserContext = { key: 'init' };
const defaultClinicContext = { key: 'init' };

export const ldContext = {
  kind: 'multi',
  user: defaultUserContext,
  clinic: defaultClinicContext,
}

export const ldClient = LDClient.initialize(__LAUNCHDARKLY_CLIENT_TOKEN__, ldContext);

const launchDarklyMiddleware = (api, win = window) => (storeAPI) => (next) => (action) => {
  const { getState } = storeAPI;
  const {
    router: { location },
  } = getState();

  if (
    !includes(trackingActions, action.type) ||
    location?.query?.noLaunchDarkly
  ) {
    return next(action);
  }

  switch (action.type) {
    case ActionTypes.LOGIN_SUCCESS: {
      const {
        blip: { clinics, allUsersMap, loggedInUserId },
      } = getState();
      const user = allUsersMap[loggedInUserId];
      console.log('user', user);
      const role = indexOf(user?.roles, 'clinic') !== -1 ? 'clinician' : 'personal'; // TBD: what if role === 'clinician'?

      ldContext.user = {
        key: user?.userid,
        role,
        application: 'Web',
      };

      const clinicianOf = filter(clinics, (clinic) => {
        return clinic?.clinicians?.[user?.userid];
      });

      if (!isEmpty(clinicianOf)) {
        if (clinicianOf.length === 1) {
          const clinic = clinicianOf[0];
          ldContext.user.permission = includes(clinic?.clinicians?.[user.userid]?.roles,'CLINIC_ADMIN')
            ? 'administrator'
            : 'member';

          ldContext.clinic = {
            key: clinic?.id,
            name: clinic?.name,
            tier: clinic?.tier,
            application: 'Web',
          };
        }
      }

      break;
    }
    case ActionTypes.SELECT_CLINIC: {
      const {
        blip: { clinics, allUsersMap, loggedInUserId },
      } = getState();
      const user = allUsersMap[loggedInUserId];
      const clinicId = action.payload.clinicId;
      if(isNull(clinicId)){
        ldContext.clinic = defaultClinicContext;
      } else {
        const selectedClinic = clinics[clinicId];

        ldContext.user.permission = includes(selectedClinic?.clinicians?.[user.userid]?.roles, 'CLINIC_ADMIN')
          ? 'administrator'
          : 'member';

        ldContext.clinic = {
          key: selectedClinic?.id,
          name: selectedClinic?.name,
          tier: selectedClinic?.tier,
          application: 'Web',
        };
      }
      break;
    }

    case ActionTypes.LOGOUT_SUCCESS: {
      ldContext.clinic = defaultClinicContext;
      ldContext.user = defaultUserContext;
      break;
    }

    default:
      break;
  }

  ldClient?.identify(ldContext, null, () => {
    console.log('New context\'s flags available for', ldContext);
  });

  return next(action);
};

export default launchDarklyMiddleware;
