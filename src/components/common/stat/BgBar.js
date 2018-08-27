import React, { PropTypes } from 'react';
import _ from 'lodash';
import { Line, Point, Rect, VictoryLabel } from 'victory';
import { Arc } from 'victory-core';
import colors from '../../../styles/colors.css';
import MGDLIcon from './assets/mgdl-inv-24-px.svg';
import MMOLIcon from './assets/mmol-inv-24-px.svg'; // TODO: Replace with mmol icon when avail
import { MGDL_UNITS } from '../../../utils/constants';
import { classifyBgValue } from '../../../utils/bloodglucose';

/* global atob */

export const BgBarLabel = props => {
  const {
    barWidth,
    bgPrefs: { bgUnits } = {},
    domain,
    width,
    scale,
    text,
    y,
  } = props;

  const labelStyle = _.assign({}, props.style, {
    pointerEvents: 'none',
  });

  const iconPadding = 20;
  const iconSrc = bgUnits === MGDL_UNITS ? MGDLIcon : MMOLIcon;

  // We need to directly embed the raw svg html in order to use them within the Victory-generated
  // charts. This is not a security concern, as we are supplying the iconSrc.
  const svgIconHTML = atob(iconSrc.replace(/data:image\/svg\+xml;base64,/, ''));

  return (
    <g>
      <VictoryLabel
        {...props}
        renderInPortal={false}
        style={labelStyle}
        text={text}
        textAnchor="end"
        verticalAnchor="middle"
        width={width}
        dx={-iconPadding}
        x={scale.y(domain.x[1])}
        y={y}
      />
      <g
        transform={`translate(${scale.y(domain.x[1]) - iconPadding}, -${barWidth / 2})`}
        dangerouslySetInnerHTML={{ __html: svgIconHTML }} // eslint-disable-line react/no-danger
      />
    </g>
  );
};

BgBarLabel.propTypes = {
  domain: PropTypes.object.isRequired,
  scale: PropTypes.object,
  text: PropTypes.func,
  y: PropTypes.number,
};

BgBarLabel.displayName = 'BgBarLabel';

export const BgBar = props => {
  const {
    barWidth,
    bgPrefs: { bgBounds } = {},
    chartLabelWidth,
    datum,
    domain,
    index,
    scale,
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

  return (
    <g>
      <Arc
        cx={barRadius}
        cy={datumY}
        r={barRadius}
        startAngle={90}
        endAngle={270}
        style={{
          stroke: 'transparent',
          fill: colors.low,
          fillOpacity: 0.5,
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
          fill: colors.low,
          fillOpacity: 0.5,
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
          fill: colors.target,
          fillOpacity: 0.5,
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
          fill: colors.high,
          fillOpacity: 0.5,
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
          fill: colors.high,
          fillOpacity: 0.5,
        }}
      />

      {renderMean && (
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
      )}

      {renderDeviation && (
        <g>
          <Line
            x1={dev1X}
            x2={dev1X}
            y1={datumY - barWidth * 2}
            y2={datumY + barWidth * 2}
            style={{
              stroke: colors.white,
              strokeWidth: 6,
            }}
          />
          <Line
            x1={dev1X}
            x2={dev1X}
            y1={datumY - barWidth * 2}
            y2={datumY + barWidth * 2}
            style={{
              stroke: colors[classifyBgValue(bgBounds, dev1Value)],
              strokeWidth: 2,
            }}
          />

          <Line
            x1={dev2X}
            x2={dev2X}
            y1={datumY - barWidth * 2}
            y2={datumY + barWidth * 2}
            style={{
              stroke: colors.white,
              strokeWidth: 6,
            }}
          />
          <Line
            x1={dev2X}
            x2={dev2X}
            y1={datumY - barWidth * 2}
            y2={datumY + barWidth * 2}
            style={{
              stroke: colors[classifyBgValue(bgBounds, dev2Value)],
              strokeWidth: 2,
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
