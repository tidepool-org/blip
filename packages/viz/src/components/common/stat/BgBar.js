import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import { Point, Rect } from 'victory';
import { Arc } from 'victory-core';
import colors from '../../../styles/colors.css';
import { classifyBgValue } from '../../../utils/bloodglucose';

export const BgBar = props => {
  const {
    barWidth,
    bgPrefs: { bgBounds } = {},
    chartLabelWidth,
    datum = {},
    domain,
    index,
    scale = {
      x: _.noop,
      y: _.noop,
    },
    width,
  } = props;

  const renderDeviation = _.isObject(datum.deviation);
  const renderMean = !renderDeviation;

  const deviation = _.get(datum, 'deviation.value', 0);

  const widthCorrection = (width - chartLabelWidth) / width;
  const widths = {
    low: scale.y(bgBounds.targetLowerBound) * widthCorrection,
    target: scale.y(bgBounds.targetUpperBound - bgBounds.targetLowerBound) * widthCorrection,
    high: scale.y(domain.x[1] - bgBounds.targetUpperBound) * widthCorrection,
  };

  const barRadius = barWidth / 2;

  const yPos = scale.x(index + 1) - (barWidth / 2);
  const datumY = yPos + (barWidth / 2);
  const datumX = scale.y(datum.y) * widthCorrection;

  const dev1Value = datum.y - deviation;
  const dev1X = scale.y(datum.y - deviation) * widthCorrection;

  const dev2Value = datum.y + deviation;
  const dev2X = scale.y(datum.y + deviation) * widthCorrection;

  const isEnabled = renderMean ? datum.y >= 0 : deviation >= 0;

  return (
    <g className="bgBar">
      <g className="bgScale">
        <Arc
          cx={barRadius}
          cy={datumY}
          r={barRadius}
          startAngle={90}
          endAngle={270}
          style={{
            stroke: 'transparent',
            fill: isEnabled ? colors.low : colors.statDisabled,
            fillOpacity: isEnabled ? 0.5 : 1,
          }}
        />
        <Rect
          {...props}
          x={barRadius}
          y={yPos}
          width={widths.low - barRadius}
          height={barWidth}
          style={{
            stroke: 'transparent',
            fill: isEnabled ? colors.low : colors.statDisabled,
            fillOpacity: isEnabled ? 0.5 : 1,
          }}
        />
        <Rect
          {...props}
          x={widths.low}
          y={yPos}
          width={widths.target}
          height={barWidth}
          style={{
            stroke: 'transparent',
            fill: isEnabled ? colors.target : colors.statDisabled,
            fillOpacity: isEnabled ? 0.5 : 1,
          }}
        />
        <Rect
          {...props}
          x={(widths.low + widths.target)}
          y={yPos}
          width={widths.high - barRadius}
          height={barWidth}
          style={{
            stroke: 'transparent',
            fill: isEnabled ? colors.high : colors.statDisabled,
            fillOpacity: isEnabled ? 0.5 : 1,
          }}
        />
        <Arc
          cx={(widths.low + widths.target + widths.high) - barRadius}
          cy={datumY}
          r={barRadius}
          startAngle={270}
          endAngle={90}
          style={{
            stroke: 'transparent',
            fill: isEnabled ? colors.high : colors.statDisabled,
            fillOpacity: isEnabled ? 0.5 : 1,
          }}
        />
      </g>

      {renderMean && isEnabled && (
        <g className="bgMean">
          <Point
            x={datumX}
            y={datumY}
            style={{
              fill: colors[classifyBgValue(bgBounds, datum.y)],
              stroke: colors.white,
              strokeWidth: 2,
            }}
            size={barWidth * 2}
          />
        </g>
      )}

      {renderDeviation && isEnabled && (
        <g className="bgDeviation">
          <Rect
            {...props}
            x={_.max([dev1X - 3, 0])}
            y={datumY - barWidth * 2 - 1}
            width={4}
            height={barWidth * 4 + 2}
            style={{
              stroke: 'white',
              strokeWidth: 2,
              fill: colors[classifyBgValue(bgBounds, _.max([dev1Value, 0.1]))],
            }}
          />

          <Rect
            {...props}
            x={_.min([dev2X - 3, width - chartLabelWidth - 3])}
            y={datumY - barWidth * 2 - 1}
            width={4}
            height={barWidth * 4 + 2}
            style={{
              stroke: 'white',
              strokeWidth: 2,
              fill: colors[classifyBgValue(bgBounds, dev2Value)],
            }}
          />
        </g>
      )}
    </g>
  );
};

BgBar.propTypes = {
  bgPrefs: PropTypes.object.isRequired,
};

BgBar.displayName = 'BgBar';

export default BgBar;
