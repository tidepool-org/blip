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

import _ from "lodash";
import bows from "bows";
import { extent } from "d3-array";
import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { MGDL_UNITS, MMOLL_UNITS } from "tideline";

import * as actions from "../../../redux/actions/";
import TrendsSVGContainer from "./TrendsSVGContainer";

import {
  MGDL_CLAMP_TOP,
  MMOLL_CLAMP_TOP,
} from "../../../utils/constants";

export class TrendsContainer extends React.Component {
  static propTypes = {
    currentCbgData: PropTypes.arrayOf(PropTypes.object).isRequired,
    days: PropTypes.arrayOf(PropTypes.string).isRequired,
    activeDays: PropTypes.shape({
      monday: PropTypes.bool.isRequired,
      tuesday: PropTypes.bool.isRequired,
      wednesday: PropTypes.bool.isRequired,
      thursday: PropTypes.bool.isRequired,
      friday: PropTypes.bool.isRequired,
      saturday: PropTypes.bool.isRequired,
      sunday: PropTypes.bool.isRequired,
    }).isRequired,
    bgPrefs: PropTypes.shape({
      bgBounds: PropTypes.shape({
        veryHighThreshold: PropTypes.number.isRequired,
        targetUpperBound: PropTypes.number.isRequired,
        targetLowerBound: PropTypes.number.isRequired,
        veryLowThreshold: PropTypes.number.isRequired,
      }).isRequired,
      bgUnits: PropTypes.oneOf([MGDL_UNITS, MMOLL_UNITS]).isRequired,
    }).isRequired,
    currentPatientInViewId: PropTypes.string.isRequired,
    extentSize: PropTypes.number.isRequired,
    loading: PropTypes.bool.isRequired,
    yScaleClampTop: PropTypes.shape({
      [MGDL_UNITS]: PropTypes.number.isRequired,
      [MMOLL_UNITS]: PropTypes.number.isRequired,
    }).isRequired,
    // data (crossfilter dimensions)
    tidelineData: PropTypes.object.isRequired,
    // handlers
    onSelectDate: PropTypes.func.isRequired,
    // viz state
    trendsState: PropTypes.shape({
      cbgFlags: PropTypes.shape({
        cbg100Enabled: PropTypes.bool.isRequired,
        cbg80Enabled: PropTypes.bool.isRequired,
        cbg50Enabled: PropTypes.bool.isRequired,
        cbgMedianEnabled: PropTypes.bool.isRequired,
      }).isRequired,
      focusedCbgSlice: PropTypes.shape({
        data: PropTypes.shape({
          firstQuartile: PropTypes.number.isRequired,
          id: PropTypes.string.isRequired,
          max: PropTypes.number.isRequired,
          median: PropTypes.number.isRequired,
          min: PropTypes.number.isRequired,
          msFrom: PropTypes.number.isRequired,
          msTo: PropTypes.number.isRequired,
          msX: PropTypes.number.isRequired,
          ninetiethQuantile: PropTypes.number.isRequired,
          tenthQuantile: PropTypes.number.isRequired,
          thirdQuartile: PropTypes.number.isRequired,
        }),
        position: PropTypes.shape({
          left: PropTypes.number.isRequired,
          tooltipLeft: PropTypes.bool.isRequired,
          topOptions: PropTypes.shape({
            firstQuartile: PropTypes.number.isRequired,
            max: PropTypes.number.isRequired,
            median: PropTypes.number.isRequired,
            min: PropTypes.number.isRequired,
            ninetiethQuantile: PropTypes.number.isRequired,
            tenthQuantile: PropTypes.number.isRequired,
            thirdQuartile: PropTypes.number.isRequired,
          }),
        }),
      }),
      focusedCbgSliceKeys: PropTypes.arrayOf(PropTypes.oneOf([
        "firstQuartile",
        "max",
        "median",
        "min",
        "ninetiethQuantile",
        "tenthQuantile",
        "thirdQuartile",
      ])),
      focusedSmbg: PropTypes.shape({
        allPositions: PropTypes.arrayOf(PropTypes.shape({
          top: PropTypes.number.isRequired,
          left: PropTypes.number.isRequired,
        })),
        allSmbgsOnDate: PropTypes.arrayOf(PropTypes.shape({
          value: PropTypes.number.isRequired,
        })),
        date: PropTypes.string.isRequired,
        datum: PropTypes.shape({
          value: PropTypes.number.isRequired,
        }),
        position: PropTypes.shape({
          top: PropTypes.number.isRequired,
          left: PropTypes.number.isRequired,
        }),
      }),
      focusedSmbgRangeAvg: PropTypes.shape({
        data: PropTypes.shape({
          id: PropTypes.string.isRequired,
          max: PropTypes.number.isRequired,
          mean: PropTypes.number.isRequired,
          min: PropTypes.number.isRequired,
          msX: PropTypes.number.isRequired,
          msFrom: PropTypes.number.isRequired,
          msTo: PropTypes.number.isRequired,
        }).isRequired,
        position: PropTypes.shape({
          left: PropTypes.number.isRequired,
          tooltipLeft: PropTypes.bool.isRequired,
          yPositions: PropTypes.shape({
            max: PropTypes.number.isRequired,
            mean: PropTypes.number.isRequired,
            min: PropTypes.number.isRequired,
          }).isRequired,
        }).isRequired,
      }),
    }).isRequired,
    unfocusCbgSlice: PropTypes.func.isRequired,
  };

  static defaultProps = {
    yScaleClampTop: {
      [MGDL_UNITS]: MGDL_CLAMP_TOP,
      [MMOLL_UNITS]: MMOLL_CLAMP_TOP,
    },
  };

  constructor(props) {
    super(props);
    this.log = bows("TrendsContainer");
    this.state = {
      yScaleDomain: null,
    };

    /** Avoid infinite mount data loop */
    this.mountingData = false;
  }

  componentDidMount() {
    this.log.info("componentDidMount");
    this.mountData();
  }

  /*
   * NB: we don't do as much here as one might expect
   * because we're using the "expose component functions"
   * strategy of communicating between components
   * (https://facebook.github.io/react/tips/expose-component-functions.html)
   * this is the legacy of blip's interface with the d3.chart-architected
   * smbg version of trends view and thus only remains
   * as a temporary compatibility interface
   */
  componentDidUpdate(prevProps) {
    const newDataLoaded = (prevProps.loading && !this.props.loading) || !_.isEqual(prevProps.days, this.props.days);
    if (newDataLoaded) {
      this.mountData();
    }
  }

  componentWillUnmount() {
    this.unfocusCbgSlice();
  }

  unfocusCbgSlice() {
    const {
      currentPatientInViewId,
      trendsState,
      unfocusCbgSlice,
    } = this.props;
    if (_.get(trendsState, "focusedCbgSlice") !== null) {
      unfocusCbgSlice(currentPatientInViewId);
    }
  }

  mountData() {
    if (this.mountingData) {
      return;
    }
    this.mountingData = true;

    const { bgPrefs, yScaleClampTop, tidelineData } = this.props;
    const { bgBounds, bgUnits } = bgPrefs;
    const upperBound = yScaleClampTop[bgUnits];
    const bgDomain = extent(tidelineData.grouped.cbg, d => d.value);
    const yScaleDomain = [bgDomain[0] ?? 0, upperBound];
    if (bgDomain[0] > bgBounds.veryLowThreshold) {
      yScaleDomain[0] = bgBounds.veryLowThreshold;
    }

    this.setState({ yScaleDomain }, () => {
      this.unfocusCbgSlice();
      this.mountingData = false;
    });
  }

  render() {
    const { days, activeDays, bgPrefs, currentCbgData } = this.props;
    const { yScaleDomain } = this.state;

    if (!Array.isArray(days) || days.length < 1 || yScaleDomain === null) {
      // Data have not yet been mounted.
      return null;
    }

    return (
      <TrendsSVGContainer
        activeDays={activeDays}
        bgPrefs={bgPrefs}
        cbgData={currentCbgData}
        dates={days}
        focusedSlice={this.props.trendsState.focusedCbgSlice}
        focusedSliceKeys={this.props.trendsState.focusedCbgSliceKeys}
        displayFlags={this.props.trendsState.cbgFlags}
        showingCbgDateTraces={_.get(this.props, "trendsState.showingCbgDateTraces", false)}
        onSelectDate={(date) => this.props.onSelectDate(date)}
        yScaleDomain={yScaleDomain}
      />
    );
  }
}

export function mapStateToProps(state, ownProps) {
  const userId = _.get(ownProps, "currentPatientInViewId");
  return {
    trendsState: _.get(state, `viz.trends.${userId}`, {}),
  };
}

export function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    unfocusCbgSlice: actions.unfocusTrendsCbgSlice,
  }, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  (stateProps, dispatchProps, ownProps) => (_.assign({}, ownProps, stateProps, dispatchProps)),
  { withRef: true },
)(TrendsContainer);
