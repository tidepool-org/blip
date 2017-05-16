
/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2017, Tidepool Project
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
 * == BSD2 LICENSE ==
 */
import React from 'react';
import sundial from 'sundial';

import personUtils from '../../core/personutils';

import tidepoolpng from './img/bw-tidepool-logo.png';

const PrintHeader = React.createClass({
  propTypes: {
    patient: React.PropTypes.object.isRequired,
    title: React.PropTypes.string.isRequired,
    dateLink: React.PropTypes.string,
  },
  render: function() {
    let patientName;
    let title;
    let dateLink = sundial.formatInTimezone(Date.now(), 'UTC', 'MMM D, YYYY');
    if (this.props.patient) {
      patientName = personUtils.patientFullName(this.props.patient);
    }
    if (this.props.title) {
      title = this.props.title;
    }
    if (this.props.dateLink) {
      dateLink = this.props.dateLink;
    }
    return (
      <div id="print" className="print-view-header">
        <p className="print-view-header-title">{ title }</p>
        <p className="print-view-header-name">{ patientName }</p>
        <p className="print-view-header-date">{ dateLink }</p>
        <div className="print-view-header-logos">
          <img className='print-view-logo' src={ tidepoolpng } alt="Tidepool logo" />
        </div>
      </div>
    );
  },
});

module.exports = PrintHeader;
