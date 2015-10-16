
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
var cx = require('classnames');

var WaitList = React.createClass({
  render: function() {
    return (
      <div className="waitlist-container" >
        <iframe id="typeform-full" width="100%" height="100%" frameBorder="0" src="https://brandon72.typeform.com/to/tKY9nN"></iframe>
      </div>
    );
  }
});

module.exports = WaitList;
