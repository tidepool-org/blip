import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import assign from 'lodash/assign';
import forEach from 'lodash/forEach';
import { components as vizComponents } from '@tidepool/viz';

import * as actions from '../../redux/actions';

const { Loader } = vizComponents;

export const withDevices = Component => props => {
  const {
    fetchers,
    fetchingDevices,
    devices,
  } = props;

  React.useEffect(() => {
    if (!fetchers) {
      return
    }

    forEach(fetchers, fetcher => {
      fetcher();
    });
  }, [])

  return fetchingDevices.completed
    ? <Component devices={devices} {...props} />
    : <Loader />;
};

/**
 * Expose "Smart" Component that is connect-ed to Redux
 */
export function getFetchers(dispatchProps, stateProps, api) {
  const fetchers = [];

  if (!stateProps.fetchingDevices.inProgress && !stateProps.fetchingDevices.completed) {
    fetchers.push(dispatchProps.fetchDevices.bind(null, api));
  }

  return fetchers;
}

export function mapStateToProps(state) {
  return {
    fetchingDevices: state.blip.working.fetchingDevices,
    devices: state.blip.devices,
  };
}

let mapDispatchToProps = dispatch => bindActionCreators({
  fetchDevices: actions.async.fetchDevices,
}, dispatch);

let mergeProps = (stateProps, dispatchProps, ownProps) => {
  var api = ownProps.api;
  return assign(
    { ...ownProps },
    stateProps,
    {
      fetchDevices: dispatchProps.fetchDevices.bind(null, api),
      fetchers: getFetchers(dispatchProps, stateProps, api),
    }
  );
};

export default Component => connect(mapStateToProps, mapDispatchToProps, mergeProps)(withDevices(Component));
