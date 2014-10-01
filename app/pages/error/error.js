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
var _ = require('lodash');

var LoginNav = require('../../components/loginnav');
var LoginLogo = require('../../components/loginlogo');

var Error = React.createClass({
  propTypes: {
    errorMessage: React.PropTypes.string
  },
  render: function() {
    /* jshint ignore:start */
    return (
      <div className="error">
        <LoginNav
          page="error"
          invite={true}/>
        <LoginLogo />
        <div className="error-message">{this.props.errorMessage}</div>
      </div>
    );
    /* jshint ignore:end */
  }
});

module.exports = Error;
