import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import assign from 'lodash/assign';
import forEach from 'lodash/forEach';
import get from 'lodash/get';
import keyBy from 'lodash/keyBy';
import { components as vizComponents } from '@tidepool/viz';

import * as actions from '../../redux/actions';

const { Loader } = vizComponents;

export const withPrescriptions = Component => props => {
  const {
    fetchers,
    fetchingClinicPrescriptions,
    prescriptions,
    prescriptionId,
  } = props;

  React.useEffect(() => {
    if (!fetchers) {
      return
    }

    forEach(fetchers, fetcher => {
      fetcher();
    });
  }, [])

  const prescription = get(keyBy(prescriptions, 'id'), prescriptionId);

  return fetchingClinicPrescriptions.completed
    ? <Component prescription={prescription} {...props} />
    : <Loader />;
};

/**
 * Expose "Smart" Component that is connect-ed to Redux
 */
export function getFetchers(dispatchProps, stateProps, api) {
  const fetchers = [];

  if (!stateProps.fetchingClinicPrescriptions.inProgress && !stateProps.fetchingClinicPrescriptions.completed) {
    fetchers.push(dispatchProps.fetchClinicPrescriptions.bind(null, api));
  }

  return fetchers;
}

export function mapStateToProps(state) {
  return {
    creatingPrescription: state.blip.working.creatingPrescription,
    creatingPrescriptionRevision: state.blip.working.creatingPrescriptionRevision,
    deletingPrescription: state.blip.working.deletingPrescription,
    fetchingClinicPrescriptions: state.blip.working.fetchingClinicPrescriptions,
    prescriptions: state.blip.prescriptions,
  };
}

let mapDispatchToProps = dispatch => bindActionCreators({
  createPrescription: actions.async.createPrescription,
  createPrescriptionRevision: actions.async.createPrescriptionRevision,
  deletePrescription: actions.async.deletePrescription,
  fetchClinicPrescriptions: actions.async.fetchClinicPrescriptions,
}, dispatch);

let mergeProps = (stateProps, dispatchProps, ownProps) => {
  var api = ownProps.api;
  return assign(
    { ...ownProps },
    stateProps,
    {
      createPrescription: dispatchProps.createPrescription.bind(null, api),
      createPrescriptionRevision: dispatchProps.createPrescriptionRevision.bind(null, api),
      deletePrescription: dispatchProps.deletePrescription.bind(null, api),
      fetchers: getFetchers(dispatchProps, stateProps, api),
      prescriptionId: ownProps.match.params.id,
      trackMetric: ownProps.trackMetric,
      history: ownProps.history
    }
  );
};

export default Component => connect(mapStateToProps, mapDispatchToProps, mergeProps)(withPrescriptions(Component));
