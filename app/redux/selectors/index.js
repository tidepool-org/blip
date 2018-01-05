import { createSelector } from 'reselect';
import _ from 'lodash';
import utils from '../../core/utils'

const getPatientData = (state, props) => _.get(
  state,
  `blip.patientDataMap[${_.get(props, 'routeParams.id')}]`
);

export const getfetchedPatientDataRange = createSelector(
  [ getPatientData ],
  (data) =>  utils.getDeviceDataRange(data),
);

export default getfetchedPatientDataRange;
