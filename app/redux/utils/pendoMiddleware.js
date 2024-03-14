import get from 'lodash/get';
import filter from 'lodash/filter';
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';
import isNull from 'lodash/isNull';
import bows from 'bows';
import config from '../../config';
import * as ActionTypes from '../constants/actionTypes';
import { isClinicianAccount } from '../../core/personutils';

const trackingActions = [
  ActionTypes.LOGIN_SUCCESS,
  ActionTypes.SELECT_CLINIC_SUCCESS,
  ActionTypes.DATA_WORKER_ADD_DATA_SUCCESS,
  ActionTypes.FETCH_CLINIC_PATIENT_COUNT_SUCCESS,
  ActionTypes.FETCH_CLINIC_PATIENT_COUNT_SETTINGS_SUCCESS,
  ActionTypes.SET_CLINIC_UI_DETAILS,
  ActionTypes.FETCH_CLINICIANS_FROM_CLINIC_SUCCESS,
];

const environments = {
  'dev1.dev.tidepool.org': 'dev',
  'qa1.development.tidepool.org': 'qa1',
  'qa2.development.tidepool.org': 'qa2',
  'qa3.development.tidepool.org': 'qa3',
  'qa4.development.tidepool.org': 'qa4',
  'qa5.development.tidepool.org': 'qa5',
  'int-app.tidepool.org': 'int',
  'external.integration.tidepool.org': 'int',
  'app.tidepool.org': 'prd',
  localhost: 'local',
};

const pendoMiddleware = (api, win = window) => (storeAPI) => (next) => (action) => {
  const { getState } = storeAPI;
  const log = bows('Pendo');

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

  const pendoAction = data => {
    const actionName = win?.pendo?.visitorId ? 'update' : 'init';
    const action = actionName === 'update' ? updateOptions : initialize;
    log(actionName, data);
    action(data);
  };

  switch (action.type) {
    case ActionTypes.LOGIN_SUCCESS: {
      const {
        blip: { clinics, allUsersMap, loggedInUserId, selectedClinicId },
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

      if (!isEmpty(clinicianOf) || selectedClinicId) {
        if (clinicianOf.length === 1 || selectedClinicId) {
          clinic = clinics[selectedClinicId] || clinicianOf[0];

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

      const role = isClinicianAccount(user) ? 'clinician' : 'personal';

      pendoAction({
        visitor: {
          id: user.userid,
          role,
          application: 'Web',
          environment: env,
          termsAccepted: user.termsAccepted,
          ...optionalVisitorProperties,
        },
        account: {
          id: clinic ? clinic.id : user.userid,
          ...optionalAccountProperties,
        },
      });
      break;
    }
    case ActionTypes.SELECT_CLINIC_SUCCESS: {
      const {
        blip: { clinics, allUsersMap, loggedInUserId },
      } = getState();

      const user = allUsersMap[loggedInUserId];
      const clinicId = action.payload.clinicId;

      if(isNull(clinicId)){
        pendoAction({
          visitor: {
            id: user.userid,
            permission: null,
          },
          account: {
            id: user.userid,
            clinic: null,
            tier: null,
            created: null,
            country: null,
            patientCount: null,
            clinicianCount: null,
          },
        });
      } else {
        const selectedClinic = clinics[clinicId];

        pendoAction({
          visitor: {
            id: user.userid,
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
            tier: selectedClinic?.tier,
            created: selectedClinic?.createdTime,
            country: selectedClinic?.country,
            patientCount: selectedClinic?.patientCount,
            clinicianCount: null,
          },
        });
      }
      break;
    }
    case ActionTypes.FETCH_CLINIC_PATIENT_COUNT_SUCCESS: {
      const {
        blip: { selectedClinicId },
      } = getState();

      const { clinicId, patientCount } = action.payload;

      if (clinicId === selectedClinicId) {
        pendoAction({
          account: {
            id: clinicId,
            patientCount,
          },
        });
      }
      break;
    }
    case ActionTypes.FETCH_CLINIC_PATIENT_COUNT_SETTINGS_SUCCESS: {
      const {
        blip: { selectedClinicId },
      } = getState();

      const { clinicId, patientCountSettings } = action.payload;

      if (clinicId === selectedClinicId) {
        pendoAction({
          account: {
            id: clinicId,
            patientCountHardLimit: patientCountSettings?.hardLimit?.patientCount,
            patientCountHardLimitStartDate: patientCountSettings?.hardLimit?.startDate,
          },
        });
      }
      break;
    }
    case ActionTypes.SET_CLINIC_UI_DETAILS: {
      const {
        blip: { selectedClinicId },
      } = getState();

      const { clinicId, uiDetails } = action.payload;

      if (clinicId === selectedClinicId) {
        pendoAction({
          account: {
            id: clinicId,
            patientLimitEnforced: uiDetails?.patientLimitEnforced,
            planName: uiDetails?.planName,
          },
        });
      }
      break;
    }
    case ActionTypes.FETCH_CLINICIANS_FROM_CLINIC_SUCCESS: {
      const {
        blip: { selectedClinicId },
      } = getState();

      const { clinicId, clinicians } = action.payload.results || {};

      if (clinicId === selectedClinicId) {
        pendoAction({
          account: {
            id: clinicId,
            clinicianCount: clinicians?.length,
          },
        });
      }
      break;
    }
    case ActionTypes.DATA_WORKER_ADD_DATA_SUCCESS: {
      const {
        blip: { loggedInUserId },
      } = getState();

      const patientId = get(action.payload, 'result.metaData.patientId');

      if (patientId === loggedInUserId) {
        const lastUpload = get(action.payload, 'result.metaData.latestDatumByType.upload._deviceTime');

        pendoAction({
          visitor: {
            id: patientId,
            lastUpload,
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
