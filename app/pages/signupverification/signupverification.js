/** @jsx React.DOM */
/**
 * Copyright (c) 2014, Tidepool Project
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

var React = require('react');

var LoginNav = require('../../components/loginnav');
var LoginLogo = require('../../components/loginlogo');

var SignupVerification = React.createClass({
  propTypes: {
    sent: React.PropTypes.bool,
    trackMetric: React.PropTypes.func.isRequired
  },
  render: function() {
    var content;
    if (this.props.sent) {
      content = (
        <div className="SignupVerification-intro">
          <div className="SignupVerification-title">{'Keeping your data private and secure is important to us!'}</div>
          <div className="SignupVerification-instructions">
            <p>{'We just sent you an email. To verify we have the right email address, please click the link in the email to activate your account.'}</p>
          </div>
        </div>
      );
    }
    else {
      content = (
        <div className="SignupVerification-intro">
          <div className="SignupVerification-title">{'Hey, you\'re not verified yet.'}</div>
            <div className="SignupVerification-instructions">
              <p>{'Check your email and follow the link there. (We need to confirm that you are really you.)'}</p>
            </div>
        </div>
      );
    }

    return (
      <div className="signup">
        <LoginNav
          page="signup"
          hideLinks={false}
          trackMetric={this.props.trackMetric} />
        <LoginLogo />
        {content}
      </div>
    );
  }
});

module.exports = SignupVerification;
