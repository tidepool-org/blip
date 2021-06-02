import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import assign from 'lodash/assign';
import forEach from 'lodash/forEach';
import { components as vizComponents } from '@tidepool/viz';

import * as actions from '../../redux/actions';

const { Loader } = vizComponents;

export const withAssociatedAccounts = Component => props => {
  const {
    fetchers,
    fetchingAssociatedAccounts,
    membershipPermissionsInOtherCareTeams,
  } = props;

  React.useEffect(() => {
    if (!fetchers) {
      return
    }

    forEach(fetchers, fetcher => {
      fetcher();
    });
  }, [])

  return fetchingAssociatedAccounts.completed
    ? <Component membershipPermissionsInOtherCareTeams={membershipPermissionsInOtherCareTeams} {...props} />
    : <Loader />;
};

/**
 * Expose "Smart" Component that is connect-ed to Redux
 */
export function getFetchers(dispatchProps, stateProps, api) {
  const fetchers = [];

  if (!stateProps.fetchingAssociatedAccounts.inProgress && !stateProps.fetchingAssociatedAccounts.completed) {
    fetchers.push(dispatchProps.fetchAssociatedAccounts.bind(null, api));
  }

  return fetchers;
}

export function mapStateToProps(state) {
  return {
    fetchingAssociatedAccounts: state.blip.working.fetchingAssociatedAccounts,
    membershipPermissionsInOtherCareTeams: state.blip.membershipPermissionsInOtherCareTeams,
  };
}

let mapDispatchToProps = dispatch => bindActionCreators({
  fetchAssociatedAccounts: actions.async.fetchAssociatedAccounts,
}, dispatch);

let mergeProps = (stateProps, dispatchProps, ownProps) => {
  var api = ownProps.api;
  return assign(
    { ...ownProps },
    stateProps,
    {
      fetchAssociatedAccounts: dispatchProps.fetchAssociatedAccounts.bind(null, api),
      fetchers: getFetchers(dispatchProps, stateProps, api),
    }
  );
};

export default Component => connect(mapStateToProps, mapDispatchToProps, mergeProps)(withAssociatedAccounts(Component));
