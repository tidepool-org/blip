import compact from 'lodash/compact';
import each from 'lodash/each';
import get from 'lodash/get';
import filter from 'lodash/filter';
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import isNull from 'lodash/isNull';
import keys from 'lodash/keys';
import reduce from 'lodash/reduce';
import uniq from 'lodash/uniq';
import values from 'lodash/values';
import bows from 'bows';
import config from '../../config';
import * as ActionTypes from '../constants/actionTypes';
import { isClinicianAccount } from '../../core/personutils';
import { setPendoData } from '../actions/sync';

const getSmartOnFhirProperties = (getState) => {
  const state = getState();
  const isSmartOnFhir = !!state?.blip?.smartOnFhirData;
  // Only include isSmartOnFhir when it's true to avoid cluttering analytics
  return isSmartOnFhir ? { isSmartOnFhir: true } : undefined;
};

const trackingActions = [
  ActionTypes.LOGIN_SUCCESS,
  ActionTypes.LOGOUT_REQUEST,
  ActionTypes.SELECT_CLINIC_SUCCESS,
  ActionTypes.DATA_WORKER_ADD_DATA_SUCCESS,
  ActionTypes.DATA_WORKER_QUERY_DATA_SUCCESS,
  ActionTypes.DATA_WORKER_REMOVE_DATA_SUCCESS,
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
  'int-api.tidepool.org': 'int',
  'external.integration.tidepool.org': 'int',
  'app.tidepool.org': 'prd',
  localhost: 'local',
};

const pendoMiddleware = (api, win = window) => (storeAPI) => (next) => (action) => {
  const { getState, dispatch } = storeAPI;
  const log = bows('Pendo');

  const {
    router: { location },
    blip: { pendoData },
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

    const updatedData = {
      account: {
        ...pendoData.account,
        ...data.account,
      },
      visitor: {
        ...pendoData.visitor,
        ...data.visitor,
      },
    };

    log(actionName, updatedData);

    if (!isEqual(pendoData, updatedData)) {
      dispatch(setPendoData(updatedData));
    }

    action(updatedData);
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

      const optionalVisitorProperties = { currentlyViewedDevices: [] };
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
      const smartProperties = getSmartOnFhirProperties(getState);

      let visitorProperties = {
        id: user.userid,
        role,
        application: 'Web',
        environment: env,
        termsAccepted: user.termsAccepted,
        ...optionalVisitorProperties,
      };
      if (smartProperties) {
        visitorProperties = { ...visitorProperties, ...smartProperties };
      }

      pendoAction({
        visitor: visitorProperties,
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

      const smartProperties = getSmartOnFhirProperties(getState);

      if(isNull(clinicId)){
        let visitorProperties = {
          id: user.userid,
          currentlyViewedDevices: [],
          permission: null,
        };
        if (smartProperties) {
          visitorProperties = { ...visitorProperties, ...smartProperties };
        }

        pendoAction({
          visitor: visitorProperties,
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

        let visitorProperties = {
          id: user.userid,
          currentlyViewedDevices: [],
          permission: includes(
            selectedClinic?.clinicians?.[user.userid]?.roles,
            'CLINIC_ADMIN'
          )
            ? 'administrator'
            : 'member',
        };
        if (smartProperties) {
          visitorProperties = { ...visitorProperties, ...smartProperties };
        }

        pendoAction({
          visitor: visitorProperties,
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
        const smartProperties = getSmartOnFhirProperties(getState);

        let visitorProperties = {
          id: patientId,
          lastUpload,
        };
        if (smartProperties) {
          visitorProperties = { ...visitorProperties, ...smartProperties };
        }

        pendoAction({
          visitor: visitorProperties,
        });
      }
      break;
    }
    case ActionTypes.DATA_WORKER_QUERY_DATA_SUCCESS: {
      const {
        blip: { currentPatientInViewId, loggedInUserId },
      } = getState();

      let currentlyViewedDevices = [];

      if (currentPatientInViewId) {
        const matchedDevices = get(action.payload, 'result.metaData.matchedDevices');

        currentlyViewedDevices = uniq(reduce(values(matchedDevices), (acc, device) => {
          each(keys(device), (key) => {
            acc.push(...parseDeviceKeyVersions(key));
          });
          return acc;
        }, []));
      }

      const smartProperties = getSmartOnFhirProperties(getState);

      let visitorProperties = {
        id: loggedInUserId,
        currentlyViewedDevices,
      };
      if (smartProperties) {
        visitorProperties = { ...visitorProperties, ...smartProperties };
      }

      pendoAction({
        visitor: visitorProperties,
      });

      break;
    }
    case ActionTypes.LOGOUT_REQUEST:
    case ActionTypes.DATA_WORKER_REMOVE_DATA_SUCCESS: {
      const {
        blip: { loggedInUserId },
      } = getState();

      const smartProperties = getSmartOnFhirProperties(getState);

      let visitorProperties = {
        id: loggedInUserId,
        currentlyViewedDevices: [],
      };
      if (smartProperties) {
        visitorProperties = { ...visitorProperties, ...smartProperties };
      }

      pendoAction({
        visitor: visitorProperties,
      });
      break;
    }
    default:
      break;
  }
  return next(action);
};

export function parseDeviceKeyVersions(key) {
  // Split on the last underscore to separate device origin from version
  const lastUnderscoreIndex = key.lastIndexOf('_');
  const deviceOrigin = key.substring(0, lastUnderscoreIndex);
  const fullVersion = key.substring(lastUnderscoreIndex + 1);

  // Extract just the semver part (everything before the '+' or '-' if they exist)
  const semver = fullVersion.split('+')[0].split('-')[0];
  const versionParts = filter(semver.split('.'), part => part && !isNaN(part));
  const result = [];

  // If no version parts, just return the key
  if (isEmpty(versionParts)) {
    return compact([key]);
  }

  // Add major version
  if (versionParts.length >= 1) {
    result.push(`${deviceOrigin}_${versionParts[0]}`);
  }

  // Add major.minor version
  if (versionParts.length >= 2) {
    result.push(`${deviceOrigin}_${versionParts[0]}.${versionParts[1]}`);
  }

  // Add major.minor.patch version
  if (versionParts.length >= 3) {
    result.push(`${deviceOrigin}_${versionParts[0]}.${versionParts[1]}.${versionParts[2]}`);
  }

  return result;
}

export default pendoMiddleware;
