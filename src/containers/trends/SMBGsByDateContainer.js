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

import React, { PropTypes } from 'react';
import _ from 'lodash';

import SMBGDatePointsAnimated from '../../components/trends/smbg/SMBGDatePointsAnimated';
import SMBGDayLineAnimated from '../../components/trends/smbg/SMBGDayLineAnimated';

const SMBGsByDateContainer = (props) => {
  const { data } = props;
  if (!data) {
    return null;
  }

  const {
    bgBounds,
    focusedSmbg,
    focusSmbg,
    grouped,
    lines,
    nonInteractive,
    onSelectDay,
    smbgOpts,
    tooltipLeftThreshold,
    unfocusSmbg,
    xScale,
    yScale,
  } = props;


  const focusedDay = focusedSmbg ? focusedSmbg.date : '';
  const smbgsByDate = _.groupBy(data, 'localDate');
  _.each(props.dates, (date) => {
    if (!smbgsByDate[date]) {
      smbgsByDate[date] = [];
    }
  });

  function getLines() {
    if (!lines) {
      if (!focusedDay) {
        return null;
      }
      return (
        <SMBGDayLineAnimated
          date={focusedDay}
          focusedDay={focusedDay}
          data={focusedSmbg.dayPoints}
          xScale={xScale}
          yScale={yScale}
          focusLine={focusSmbg}
          unfocusLine={unfocusSmbg}
          onSelectDay={onSelectDay}
          grouped={grouped}
          tooltipLeftThreshold={tooltipLeftThreshold}
          nonInteractive={nonInteractive}
        />
      );
    }
    return _.map(smbgsByDate, (smbgs, date) => (
      <SMBGDayLineAnimated
        key={date}
        date={date}
        focusedDay={focusedDay}
        data={smbgs}
        xScale={xScale}
        yScale={yScale}
        focusLine={focusSmbg}
        unfocusLine={unfocusSmbg}
        onSelectDay={onSelectDay}
        grouped={grouped}
        tooltipLeftThreshold={tooltipLeftThreshold}
        nonInteractive={nonInteractive}
      />
    ));
  }

  function getPoints() {
    return _.map(smbgsByDate, (smbgs, date) => (
      <SMBGDatePointsAnimated
        bgBounds={bgBounds}
        data={smbgs}
        date={date}
        focusSmbg={focusSmbg}
        grouped={grouped}
        isFocused={focusedDay === date}
        key={date}
        nonInteractive={nonInteractive}
        onSelectDay={onSelectDay}
        smbgOpts={smbgOpts}
        tooltipLeftThreshold={tooltipLeftThreshold}
        unfocusSmbg={unfocusSmbg}
        xScale={xScale}
        yScale={yScale}
      />
    ));
  }

  return (
    <g id="smbgsByDateContainer">
      {getLines()}
      {getPoints()}
    </g>
  );
};

SMBGsByDateContainer.propTypes = {
  bgBounds: PropTypes.shape({
    veryHighThreshold: PropTypes.number.isRequired,
    targetUpperBound: PropTypes.number.isRequired,
    targetLowerBound: PropTypes.number.isRequired,
    veryLowThreshold: PropTypes.number.isRequired,
  }).isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({
    // here only documenting the properties we actually use rather than the *whole* data model!
    id: PropTypes.string.isRequired,
    localDate: PropTypes.string.isRequired,
    msPer24: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
  })).isRequired,
  dates: PropTypes.arrayOf(PropTypes.string).isRequired,
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
  focusSmbg: PropTypes.func.isRequired,
  grouped: PropTypes.bool.isRequired,
  lines: PropTypes.bool.isRequired,
  nonInteractive: PropTypes.bool,
  onSelectDay: PropTypes.func.isRequired,
  smbgOpts: PropTypes.shape({
    maxR: PropTypes.number.isRequired,
    r: PropTypes.number.isRequired,
  }).isRequired,
  tooltipLeftThreshold: PropTypes.number.isRequired,
  unfocusSmbg: PropTypes.func.isRequired,
  xScale: PropTypes.func.isRequired,
  yScale: PropTypes.func.isRequired,
};

export default SMBGsByDateContainer;
