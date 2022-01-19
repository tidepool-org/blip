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
import { formatParameterValue } from "../../../utils/format";
import Tooltip from "../../common/tooltips/Tooltip";
import colors from "../../../styles/colors.css";
import styles from "./ParameterTooltip.css";

class ParameterTooltip extends React.Component {
  constructor(props) {
    super(props);

    this.hourMinuteFormat = getHourMinuteFormat();
  }

  renderParameter(parameter) {
    const parameterId = parameter.id;
    let previousValue = null;
    let prevToNext = null;
    let valueClassName = styles.value;
    if (typeof parameter.previousValue === "string") {
      const previous = formatParameterValue(parameter.previousValue, parameter.units);
      previousValue = <span id={`tooltip-daily-parameter-${parameterId}-prev`} className={styles.previous} key={`${parameterId}-prev`}>{previous}</span>;
      prevToNext = <span id={`tooltip-daily-parameter-${parameterId}-arrow`} key={`${parameterId}-arrow`}>&rarr;</span>;
    } else {
      valueClassName = `${valueClassName} ${styles["value-no-prev"]}`;
    }

    const displayHour = moment.tz(parameter.epoch, parameter.timezone).format(this.hourMinuteFormat);
    const value = formatParameterValue(parameter.value, parameter.units);

    return [
      <span id={`tooltip-daily-parameter-${parameterId}-date`} className={styles.date} key={`${parameterId}-date`}>{displayHour}</span>,
      <span id={`tooltip-daily-parameter-${parameterId}-name`} className={styles.label} key={`${parameterId}-name`}>
        {i18next.t(`params|${parameter.name}`)}
      </span>,
      previousValue,
      prevToNext,
      <span id={`tooltip-daily-parameter-${parameterId}-value`} className={valueClassName} key={`${parameterId}-value`}>{value}</span>,
      <span id={`tooltip-daily-parameter-${parameterId}-units`} className={styles.units} key={`${parameterId}-units`}>{i18next.t(parameter.units)}</span>,
    ];
  }

  renderParameters(parameters) {
    const rows = [];
    for (let i = 0; i < parameters.length; ++i) {
      Array.prototype.push.apply(rows, this.renderParameter(parameters[i]));
    }

    return (
      <div id="tooltip-daily-parameters" className={styles.container}>
        {rows}
      </div>
    );
  }

  render() {
    const { parameter, timePrefs, title } = this.props;

    let dateTitle = null;
    if (title === null) {
      dateTitle = {
        source: _.get(parameter, "source", "Diabeloop"),
        normalTime: parameter.normalTime,
        timezone: _.get(parameter, "timezone", "UTC"),
        timePrefs,
      };
    }

    const content = this.renderParameters(parameter.params);
    return (
      <Tooltip
        {...this.props}
        title={title}
        dateTitle={dateTitle}
        content={content}
      />
    );
  }
}

ParameterTooltip.propTypes = {
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
  parameter: PropTypes.shape({
    normalTime: PropTypes.string.isRequired,
    timezone: PropTypes.string.isRequired,
    params: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        normalTime: PropTypes.string.isRequired,
        timezone: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
        previousValue: PropTypes.string,
        units: PropTypes.string.isRequired,
        source: PropTypes.string,
      })).isRequired,
  }).isRequired,
  timePrefs: PropTypes.object.isRequired,
};

ParameterTooltip.defaultProps = {
  tail: true,
  side: "right",
  tailWidth: 9,
  tailHeight: 17,
  tailColor: colors.deviceEvent,
  borderColor: colors.deviceEvent,
  borderWidth: 2,
  title: null,
};

export default ParameterTooltip;
