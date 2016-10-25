/**
 * Copyright (c) 2016, Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 */

import React, { PropTypes, Component } from 'react'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import cx from 'classnames';

import BrowserWarningComponent from '../../components/browserwarning';

export class BrowserWarning extends Component {
  static propTypes = {
    authenticated: PropTypes.bool.isRequired,
    trackMetric: React.PropTypes.func.isRequired
  };

  render() {
    var classes = {
      'container-box-outer': true, 
      'browser-warning-logged-out': !this.props.authenticated
    }
    return <div className={cx(classes)}>
      <div className="browser-warning-container">
        <BrowserWarningComponent
          trackMetric={this.props.trackMetric} />
      </div>
    </div>;
  }
}

export function mapStateToProps(state) {
  return {
    authenticated: state.blip.isLoggedIn
  };
}

let mapDispatchToProps = {};

let mergeProps = (stateProps, dispatchProps, ownProps) => {
  return Object.assign({}, stateProps, dispatchProps, {
    trackMetric: ownProps.routes[0].trackMetric
  });
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(BrowserWarning);
