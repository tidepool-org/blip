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

import _ from "lodash";
import PropTypes from "prop-types";
import React from "react";

import { SITE_CHANGE_RESERVOIR, DEFAULT_MANUFACTURER, SITE_CHANGE } from "../../logic/constants";
import Change from "../sitechange/Change";
import NoChange from "../sitechange/NoChange";

function SiteChange(props) {
  const getValue = () => {
    return props.data.infusionSiteHistory[props.date];
  };

  const type = props.subtotalType ?? SITE_CHANGE_RESERVOIR;
  const value = getValue();
  const manufacturer = _.get(_.last(value.data), "pump.manufacturer", DEFAULT_MANUFACTURER);
  value.count = value.count ?? 1; //default value
  // Reservoir Change
  const siteChangeComponent =
    value.type === SITE_CHANGE ? (
      <Change daysSince={value.daysSince} count={value.count} type={type} manufacturer={manufacturer} />
    ) : (
      <NoChange />
    );
  return <div className="SiteChange">{siteChangeComponent}</div>;
}

SiteChange.propTypes = {
  data: PropTypes.object.isRequired,
  date: PropTypes.string.isRequired,
  subtotalType: PropTypes.string,
};

export default SiteChange;
