import filter from 'lodash/filter';
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';
import isNull from 'lodash/isNull';

import * as ActionTypes from '../constants/actionTypes';
import personUtils from '../../core/personutils';

/* global __LAUNCHDARKLY_CLIENT_TOKEN__ */

const trackingActions = [ActionTypes.LOGIN_SUCCESS, ActionTypes.SELECT_CLINIC_SUCCESS, ActionTypes.LOGOUT_SUCCESS];

const defaultClinicContext = { key: 'none' };
const defaultUserContext = { key: 'anon' };

export const ldContext = {
  kind: 'multi',
  clinic: defaultClinicContext,
  user: defaultUserContext,
}

const launchDarklyMiddleware = () => (storeAPI) => (next) => (action) => {
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
      const role = personUtils.isClinicianAccount(user) ? 'clinician' : 'personal';

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

          ldContext.user.permission = includes(clinic?.clinicians?.[user.userid]?.roles, 'CLINIC_ADMIN')
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
    case ActionTypes.SELECT_CLINIC_SUCCESS: {
      const {
        blip: { clinics, allUsersMap, loggedInUserId },
      } = getState();
      const user = allUsersMap[loggedInUserId];
      const clinicId = action.payload.clinicId;
      const selectedClinic = clinics[clinicId];

      if(!selectedClinic || isNull(selectedClinic?.id)){
        ldContext.clinic = defaultClinicContext;
      } else {

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

  return next(action);
};

export default launchDarklyMiddleware;
