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

var React = window.React;

var MailTo = React.createClass({
  propTypes: {
    linkTitle : React.PropTypes.string.isRequired,
    emailAddress : React.PropTypes.string.isRequired,
    emailSubject : React.PropTypes.string.isRequired,
    onLinkClicked: React.PropTypes.func.isRequired
  },

  render: function() {

    var mailtoInfo = 'mailto:'+this.props.emailAddress+'?Subject='+this.props.emailSubject;

    return (
      /* jshint ignore:start */
      <div className='mailto'>
        <a href={mailtoInfo} onClick={this.props.onLinkClicked} target='_top'>{this.props.linkTitle}</a>
      </div>
      /* jshint ignore:end */
    );
  }

});

module.exports = MailTo;
