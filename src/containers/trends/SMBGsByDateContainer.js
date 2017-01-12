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
import SMBGDateLineAnimated from '../../components/trends/smbg/SMBGDateLineAnimated';

const SMBGsByDateContainer = (props) => {
  const { data } = props;
  if (!data) {
    return null;
  }

  const {
    anSmbgRangeAvgIsFocused,
    bgBounds,
    focusedSmbg,
    focusSmbg,
    grouped,
    lines,
    nonInteractive,
    onSelectDay,
    smbgOpts,
    someSmbgDataIsFocused,
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
    const allDateLines = [];
    _.each(smbgsByDate, (smbgs, date) => {
      const dateData = lines ? smbgs : [];
      allDateLines.push((
        <SMBGDateLineAnimated
          bgBounds={bgBounds}
          data={dateData}
          date={date}
          focusedDay={focusedDay}
          focusLine={focusSmbg}
          grouped={grouped}
          key={date}
          onSelectDay={onSelectDay}
          nonInteractive={nonInteractive}
          tooltipLeftThreshold={tooltipLeftThreshold}
          unfocusLine={unfocusSmbg}
          xScale={xScale}
          yScale={yScale}
        />
      ));
    });
    if (focusedDay) {
      allDateLines.push((
        <SMBGDateLineAnimated
          bgBounds={bgBounds}
          data={focusedSmbg.allSmbgsOnDate}
          date={focusedDay}
          key={`${focusedDay}-focused`}
          focusedDay={focusedDay}
          focusLine={focusSmbg}
          grouped={grouped}
          onSelectDay={onSelectDay}
          nonInteractive={nonInteractive}
          tooltipLeftThreshold={tooltipLeftThreshold}
          unfocusLine={unfocusSmbg}
          xScale={xScale}
          yScale={yScale}
        />
      ));
    }
    return allDateLines;
  }

  function getPoints() {
    return _.map(smbgsByDate, (smbgs, date) => (
      <SMBGDatePointsAnimated
        anSmbgRangeAvgIsFocused={anSmbgRangeAvgIsFocused}
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
        someSmbgDataIsFocused={someSmbgDataIsFocused}
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
  anSmbgRangeAvgIsFocused: PropTypes.bool.isRequired,
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
  someSmbgDataIsFocused: PropTypes.bool.isRequired,
  tooltipLeftThreshold: PropTypes.number.isRequired,
  unfocusSmbg: PropTypes.func.isRequired,
  xScale: PropTypes.func.isRequired,
  yScale: PropTypes.func.isRequired,
};

export default SMBGsByDateContainer;
