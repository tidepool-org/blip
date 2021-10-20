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

import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import i18next from "i18next";
import moment from "moment-timezone";

import { getHourMinuteFormat } from "../../../utils/datetime";
import Tooltip from "../../common/tooltips/Tooltip";
import colors from "../../../styles/colors.css";
import styles from "./WarmUpTooltip.css";

function WarmUpTooltip(props) {
  const { datum, timePrefs, title } = props;

  const timezone = _.get(datum, "timezone", "UTC");
  let dateTitle = null;
  if (title === null) {
    dateTitle = {
      source: _.get(datum, "source", "Diabeloop"),
      normalTime: datum.normalTime,
      timezone,
      timePrefs,
    };
  }

  const endTime = moment.tz(datum.epochEnd, timezone).format(getHourMinuteFormat());
  const content = (
    <div id="sensor-warmup-container" className={styles.container}>
      <div id="sensor-warmup-title" className={styles.label}>{i18next.t("sensor-warmup")}</div>
      <div id="sensor-warmup-session-end" className={styles.labelEnd}>
        <span id="sensor-warmup-session-end-text" className={styles.labelEndText}>{i18next.t("sensor-warmup-session-end")}</span>
        <span id="sensor-warmup-session-end-hour" className={styles.labelEndTime}>{endTime}</span>
      </div>
    </div>
  );

  return (
    <Tooltip
      {...props}
      title={title}
      dateTitle={dateTitle}
      content={content}
    />
  );
}

WarmUpTooltip.propTypes = {
  position: PropTypes.shape({
    top: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
  }).isRequired,
  offset: PropTypes.shape({
    top: PropTypes.number.isRequired,
    left: PropTypes.number,
    horizontal: PropTypes.number,
  }),
  title: PropTypes.node,
  tail: PropTypes.bool,
  side: PropTypes.oneOf(["top", "right", "bottom", "left"]),
  tailColor: PropTypes.string,
  tailWidth: PropTypes.number,
  tailHeight: PropTypes.number,
  backgroundColor: PropTypes.string,
  borderColor: PropTypes.string,
  borderWidth: PropTypes.number,
  datum: PropTypes.shape({
    normalTime: PropTypes.string.isRequired,
    epoch: PropTypes.number.isRequired,
    epochEnd: PropTypes.number.isRequired,
  }).isRequired,
  timePrefs: PropTypes.object.isRequired,
};

WarmUpTooltip.defaultProps = {
  tail: true,
  side: "right",
  tailWidth: 9,
  tailHeight: 17,
  tailColor: colors.deviceEvent,
  borderColor: colors.deviceEvent,
  borderWidth: 2,
  title: null,
};

export default WarmUpTooltip;
