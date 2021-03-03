import * as React from 'react';
import PropType from 'prop-types';
import _ from 'lodash';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunkMiddleware from 'redux-thunk';
import bows from 'bows';

import { reducers as vizReducers } from 'tidepool-viz';

import '../../viz/src/styles/colors.css';
import '../../tideline/css/tideline.less';
import '../app/style.less';

import { FETCH_PATIENT_DATA_SUCCESS, LOGOUT_REQUEST } from '../app/redux/constants/actionTypes';
import { updateConfig } from '../app/config';
import PatientData from './patient-data';

const logger = bows('Blip');
/** @type {import('redux').Store} */
let store = null;

function blipReducer(state, action) {
  if ([FETCH_PATIENT_DATA_SUCCESS, LOGOUT_REQUEST].includes(action.type)) {
    logger.debug(action.type, _.cloneDeep({ state, action }));
  }

  if (_.isEmpty(state)) {
    return {
      currentPatientInViewId: null,
    };
  }

  switch (action.type) {
  case FETCH_PATIENT_DATA_SUCCESS:
    state.currentPatientInViewId = action.payload.patientId;
    break;
  case LOGOUT_REQUEST:
    state.currentPatientInViewId = null;
    break;
  }

  return state;
}

/**
 * @param {import('./index').BlipProperties} props For blip view
 */
function ReduxProvider(props) {
  if (store === null) {
    // I love redux
    store = applyMiddleware(thunkMiddleware)(createStore)(combineReducers({ viz: vizReducers, blip: blipReducer }), {
      viz: {},
      blip: { currentPatientInViewId: null },
    });
  }
  return (
    // @ts-ignore
    <Provider store={store}>
      <PatientData api={props.api} store={store} patient={props.patient} profileDialog={props.profileDialog} />
    </Provider>
  );
}

ReduxProvider.propTypes = {
  api: PropType.object.isRequired,
  patient: PropType.object.isRequired,
  profileDialog: PropType.func.isRequired,
};

/**
 * @param {import('./index').BlipProperties} props For blip view
 */
function Blip(props) {
  if (typeof props === 'object') {
    try {
      const { config, api, patient, profileDialog } = props;
      const blipConfig = updateConfig(config);
      logger.info('blip config:', blipConfig);

      return <ReduxProvider api={api} patient={patient} profileDialog={profileDialog} />;
    } catch (err) {
      logger.error(err);
    }
  } else {
    logger.error('Blip: Missing props');
  }
  return null;
}

Blip.propTypes = {
  config: PropType.object.isRequired,
  api: PropType.object.isRequired,
  patient: PropType.object.isRequired,
  profileDialog: PropType.func.isRequired,
};

export default Blip;
