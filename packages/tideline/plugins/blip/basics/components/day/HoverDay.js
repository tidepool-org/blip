import i18next from "i18next";
import PropTypes from "prop-types";
import React from "react";
import moment from "moment-timezone";

import { getCount } from "../BasicsUtils";
import { MS_IN_DAY } from "../../logic/constants";

const t = i18next.t.bind(i18next);

class HoverDay extends React.Component {
  getCount = getCount;

  handleClickDay = () => {
    this.props.onSelectDay(
      moment
        .tz(this.props.date, this.props.timezone)
        .startOf("day")
        // add 1/2 of 24 hrs in milliseconds, because the date used to switch
        // refers to the center, not the left edge, of the daily view switching to
        // but we want the left edge at midnight
        .add(MS_IN_DAY / 2, "milliseconds"),
      this.props.title
    );
  };

  mouseEnter = () => {
    this.props.onHover(this.props.date);
  };

  mouseLeave = () => {
    this.props.onHover(null);
  };

  render() {
    const { type, date } = this.props;
    const containerClass = `Calendar-day--${type} Calendar-day--HOVER`;

    var display = <div className="Calendar-day-text">{this.getCount(this.props.subtotalType)}</div>;

    if (this.props.hoverDisplay) {
      display = this.props.hoverDisplay({ data: this.props.data, date, trackMetric: this.props.trackMetric });
    }

    return (
      <div id={`calendar-day-${type}-${date}-hover`} className={containerClass} onClick={this.handleClickDay} onMouseEnter={this.mouseEnter} onMouseLeave={this.mouseLeave}>
        <p className="Calendar-weekday">{moment.utc(this.props.date).format(t(this.props.dayAbbrevMask))}</p>
        {display}
      </div>
    );
  }
}

HoverDay.propTypes = {
  data: PropTypes.object,
  date: PropTypes.string.isRequired,
  dayAbbrevMask: PropTypes.string,
  hoverDisplay: PropTypes.func,
  onHover: PropTypes.func.isRequired,
  onSelectDay: PropTypes.func.isRequired,
  subtotalType: PropTypes.string,
  timezone: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  trackMetric: PropTypes.func.isRequired,
};

HoverDay.defaultProps = {
  dayAbbrevMask: "MMM D",
};

export default HoverDay;
