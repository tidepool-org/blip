import { createSelector } from 'reselect';
import _ from 'lodash';
import utils from '../../core/utils'

const getPatientData = (state, props) => _.get(
  state,
  `blip.patientDataMap[${_.get(props, 'routeParams.id')}]`,
  []
);

const getPatientFetchedUntil = (state, props) => _.get(
  state,
  `blip.patientDataMap[${_.get(props, 'routeParams.id')}_fetchedUntil]`
);

export const getfetchedPatientDataRange = createSelector(
  [ getPatientData, getPatientFetchedUntil ],
  (data, fetchedUntil) =>  _.assign({}, utils.getDeviceDataRange(data), {
    fetchedUntil,
    count: data.length,
  }),
);

export default getfetchedPatientDataRange;
