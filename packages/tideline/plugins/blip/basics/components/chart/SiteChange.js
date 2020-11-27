/* 
 * == BSD2 LICENSE ==
 * Copyright (c) 2015 Tidepool Project
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

var _ = require('lodash');
var PropTypes = require('prop-types');
var React = require('react');

var constants = require('../../logic/constants');
var Change = require('../sitechange/Change');
var NoChange = require('../sitechange/NoChange');

class SiteChange extends React.Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    date: PropTypes.string.isRequired,
    subtotalType: PropTypes.string,
  };

  render() {
    var type = this.props.subtotalType || constants.SITE_CHANGE_RESERVOIR;
    var value = this.getValue();
    value.count = value.count || 1; //default value
    var siteChangeComponent = 
      ( value.type === constants.SITE_CHANGE) ?
        <Change daysSince={value.daysSince} count={value.count} type={type} /> :
        <NoChange />;
    return (
      <div className='SiteChange'>
        {siteChangeComponent}
      </div>
    );
  }

  getValue = () => {
    return this.props.data.infusionSiteHistory[this.props.date];
  };
}

module.exports = SiteChange;