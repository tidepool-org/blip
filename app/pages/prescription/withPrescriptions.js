import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import assign from 'lodash/assign';
import forEach from 'lodash/forEach';
import { components as vizComponents } from '@tidepool/viz';

import * as actions from '../../redux/actions';

const { Loader } = vizComponents;

const withPrescriptions = Component => props => {
  const { prescriptions, fetchers, fetchingPrescriptions } = props;

  React.useEffect(() => {
    if (!fetchers) {
      return
    }

    forEach(fetchers, fetcher => {
      fetcher();
    });
  }, [])

  return fetchingPrescriptions.inProgress
    ? <Loader />
    : <Component prescriptions={prescriptions} {...props} />;
};

/**
 * Expose "Smart" Component that is connect-ed to Redux
 */
export function getFetchers(dispatchProps, stateProps, api) {
  const fetchers = [];

  if (!stateProps.fetchingPrescriptions.inProgress && !stateProps.fetchingPrescriptions.completed) {
    fetchers.push(dispatchProps.fetchPrescriptions.bind(null, api));
  }

  return fetchers;
}

export function mapStateToProps(state) {
  return {
    prescriptions: state.blip.prescriptions,
    fetchingPrescriptions: state.blip.working.fetchingPrescriptions,
  };
}

let mapDispatchToProps = dispatch => bindActionCreators({
  fetchPrescriptions: actions.async.fetchPrescriptions,
}, dispatch);

let mergeProps = (stateProps, dispatchProps, ownProps) => {
  var api = ownProps.routes[0].api;
  return assign(
    {},
    stateProps,
    {
      fetchers: getFetchers(dispatchProps, stateProps, api),
      trackMetric: ownProps.routes[0].trackMetric
    }
  );
};

export default Component => connect(mapStateToProps, mapDispatchToProps, mergeProps)(withPrescriptions(Component));
