import { createSelector } from 'reselect';
import _ from 'lodash';
import utils from '../../core/utils'

const getPatientData = (state, props) => _.get(
  state,
  `blip.patientDataMap[${_.get(props, 'routeParams.id')}]`,
  []
);

const getPatientDataFetchedUntil = (state, props) => _.get(
  state,
  `blip.patientDataMap[${_.get(props, 'routeParams.id')}_fetchedUntil]`
);

export const getfetchedPatientDataRange = createSelector(
  [ getPatientData, getPatientDataFetchedUntil ],
  (data, fetchedUntil) =>  {
    const diabetesDataRange = utils.getDiabetesDataRange(data);
    return _.assign({}, diabetesDataRange, {
      fetchedUntil,
    });
  }
);
