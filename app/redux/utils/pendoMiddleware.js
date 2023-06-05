import filter from 'lodash/filter';
import includes from 'lodash/includes';
import indexOf from 'lodash/indexOf';
import isEmpty from 'lodash/isEmpty';
import isNull from 'lodash/isNull';
import config from '../../config';
import * as ActionTypes from '../constants/actionTypes';

const trackingActions = [ActionTypes.LOGIN_SUCCESS, ActionTypes.SELECT_CLINIC];

const environments = {
  'dev1.dev.tidepool.org': 'dev',
  'qa1.development.tidepool.org': 'qa1',
  'qa2.development.tidepool.org': 'qa2',
  'int-app.tidepool.org': 'int',
  'external.integration.tidepool.org': 'int',
  'app.tidepool.org': 'prd',
  localhost: 'local',
};

const pendoMiddleware = (api, win = window) => (storeAPI) => (next) => (action) => {
  const { getState } = storeAPI;
  const {
    router: { location },
  } = getState();
  if (
    !config.PENDO_ENABLED ||
    !includes(trackingActions, action.type) ||
    location?.query?.noPendo
  ) {
    return next(action);
  }
  const { initialize, updateOptions } = win?.pendo || {};
  switch (action.type) {
    case ActionTypes.LOGIN_SUCCESS: {
      const {
        blip: { clinics, allUsersMap, loggedInUserId },
      } = getState();
      const user = allUsersMap[loggedInUserId];
      const hostname = win?.location?.hostname;
      const env = environments?.[hostname] || 'unknown';
      const clinicianOf = filter(clinics, (clinic) => {
        return clinic?.clinicians?.[user?.userid];
      });
      const optionalVisitorProperties = {};
      const optionalAccountProperties = {};
      let clinic = null;
      if (!isEmpty(clinicianOf)) {
        if (clinicianOf.length === 1) {
          clinic = clinicianOf[0];
          optionalVisitorProperties.permission = includes(
            clinic?.clinicians?.[user.userid]?.roles,
            'CLINIC_ADMIN'
          )
            ? 'administrator'
            : 'member';
          optionalVisitorProperties.domain = user.username.split('@')[1];
          optionalAccountProperties.clinic = clinic?.name;
        }
      }
      const role = indexOf(user?.roles, 'clinic') !== -1 ? 'clinician' : 'personal';

      initialize({
        visitor: {
          id: user.userid,
          role,
          application: 'Web',
          environment: env,
          ...optionalVisitorProperties,
        },
        account: {
          id: clinic ? clinic.id : user.userid,
          ...optionalAccountProperties,
        },
      });
      break;
    }
    case ActionTypes.SELECT_CLINIC: {
      const {
        blip: { clinics, allUsersMap, loggedInUserId },
      } = getState();
      const user = allUsersMap[loggedInUserId];
      const clinicId = action.payload.clinicId;
      if(isNull(clinicId)){
        updateOptions({
          visitor: {
            permission: null,
          },
          account: {
            id: user.userid,
            clinic: null,
          },
        });
      } else {
        const selectedClinic = clinics[clinicId];
        updateOptions({
          visitor: {
            permission: includes(
              selectedClinic?.clinicians?.[user.userid]?.roles,
              'CLINIC_ADMIN'
            )
              ? 'administrator'
              : 'member',
          },
          account: {
            id: clinicId,
            clinic: selectedClinic?.name,
          },
        });
      }
      break;
    }
    default:
      break;
  }
  return next(action);
};

export default pendoMiddleware;
