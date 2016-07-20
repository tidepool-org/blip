/*
 * == BSD2 LICENSE ==
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
 * == BSD2 LICENSE ==
 */

import bows from 'bows';
import React, { PropTypes } from 'react';

// tideline dependencies & plugins
var tidelineBlip = require('tideline/plugins/blip');
var modalDay = tidelineBlip.modalday.modalDay;

class SMBGTrends extends React.Component {
  static propTypes = {
    bgClasses: PropTypes.object.isRequired,
    bgDomain: PropTypes.array.isRequired,
    bgUnits: PropTypes.string.isRequired,
    boxOverlay: PropTypes.bool.isRequired,
    data: PropTypes.array.isRequired,
    grouped: PropTypes.bool.isRequired,
    showingLines: PropTypes.bool.isRequired,
    timezone: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
    this.log = bows('SMBGTrends');
  }

  componentDidMount() {
    const { bgDomain, bgUnits, timezone } = this.props;
    this.log('Mounting...');
    this.chart = modalDay.create(document.getElementById('tidelineContainer'), {
      bgDomain,
      bgUnits,
      clampTop: true,
      timezone,
    });
    console.time('SMBGTrends Draw');
    const { bgClasses, boxOverlay, grouped, showingLines } = this.props;
    this.chart.render(this.props.data, {
      bgClasses,
      bgUnits,
      boxOverlay,
      grouped,
      showingLines,
    });
    console.timeEnd('SMBGTrends Draw');
  }

  componentDidUpdate() {
    console.time('SMBGTrends Draw');
    const { bgClasses, bgUnits, boxOverlay, grouped, showingLines } = this.props;
    this.chart.render(this.props.data, {
      bgClasses,
      bgUnits,
      boxOverlay,
      grouped,
      showingLines,
    });
    console.timeEnd('SMBGTrends Draw');
  }

  componentWillUnmount() {
    this.log('Unmounting...')
    this.chart.destroy();
  }

  render() {
    return null;
  }
}

export default SMBGTrends;
