/*
== BSD2 LICENSE ==
Copyright (c) 2014, Tidepool Project

This program is free software; you can redistribute it and/or modify it under
the terms of the associated License, which is identical to the BSD 2-Clause
License as published by the Open Source Initiative at opensource.org.

This program is distributed in the hope that it will be useful, but WITHOUT
ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
FOR A PARTICULAR PURPOSE. See the License for more details.

You should have received a copy of the License along with this program; if
not, you can obtain one from Tidepool Project at tidepool.org.
== BSD2 LICENSE ==
*/

import _ from "lodash";
import i18next from "i18next";
import moment from "moment-timezone";

const t = i18next.t.bind(i18next);

export function isTimezoneAware() {
  const timezoneAware = _.get(this.props, "timePrefs.timezoneAware", false);
  const timezoneName = _.get(this.props, "timePrefs.timezoneName", null);
  return timezoneAware && timezoneName !== null;
}

export function getDisplayTimestamp(/** @type {moment.Moment | string} */ ts) {
  const format = t("MMMM D [at] h:mm a");
  const timezone = _.get(this.props, "timePrefs.timezoneName", "UTC");
  let m = ts;
  if (!moment.isMoment(ts)) {
    m = moment.utc(ts);
  }
  const displayTimestamp = m.tz(timezone).format(format);
  return displayTimestamp;
}
